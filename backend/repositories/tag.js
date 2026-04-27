const { getDB } = require("../db/db");
const BusinessError = require("../utils/BusinessError");

class TagRepository {
    _getPreparedStatements() {
        const db = getDB();
        if (this._stmts) return this._stmts;

        this._stmts = {
            selectAllTags: db.prepare(
                "SELECT id, name, last_used_at FROM tags ORDER BY name ASC",
            ),
            selectTagByName: db.prepare(
                "SELECT id, name FROM tags WHERE name = ?",
            ),
            selectTagById: db.prepare("SELECT id, name FROM tags WHERE id = ?"),
            updateTagName: db.prepare("UPDATE tags SET name = ? WHERE id = ?"),
            updateTagLastUsed: db.prepare(
                "UPDATE tags SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?",
            ),
            deleteTag: db.prepare("DELETE FROM tags WHERE id = ?"),
        };
        return this._stmts;
    }

    getAllTags() {
        const db = getDB();
        const sql = `
      SELECT t.id, t.name, t.last_used_at, COUNT(qt.quote_id) as count
      FROM tags t
      LEFT JOIN quote_tags qt ON t.id = qt.tag_id
      GROUP BY t.id
      ORDER BY count DESC, t.name ASC
    `;
        const tags = db.prepare(sql).all();

        return tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            count: tag.count,
            lastUsedAt: tag.last_used_at,
        }));
    }

    renameTag(tagId, newName) {
        const stmts = this._getPreparedStatements();

        // 1. 检查标签是否存在
        const oldTag = stmts.selectTagById.get(tagId);
        if (!oldTag) {
            throw new BusinessError(`标签 ID "${tagId}" 不存在`, -1, 404);
        }

        // 2. 检查新名称是否已存在
        const existingTag = stmts.selectTagByName.get(newName);
        if (existingTag) {
            throw new BusinessError(`标签 "${newName}" 已存在`, -1, 409);
        }

        // 3. 执行重命名
        stmts.updateTagName.run(newName, tagId);
        stmts.updateTagLastUsed.run(tagId);

        return {
            id: tagId,
            name: newName,
        };
    }

    getStats() {
        const db = getDB();

        // 总摘抄数
        const totalQuotes = db
            .prepare("SELECT COUNT(*) as count FROM quotes")
            .get().count;

        // 总标签数
        const totalTags = db
            .prepare("SELECT COUNT(*) as count FROM tags")
            .get().count;

        // 今日新增
        const todayQuotes = db
            .prepare(
                `
      SELECT COUNT(*) as count
      FROM quotes
      WHERE date(updated_at) = date('now')
    `,
            )
            .get().count;

        // 本周新增
        const weekQuotes = db
            .prepare(
                `
      SELECT COUNT(*) as count
      FROM quotes
      WHERE updated_at >= date('now', '-7 days')
    `,
            )
            .get().count;

        // 本月新增
        const monthQuotes = db
            .prepare(
                `
      SELECT COUNT(*) as count
      FROM quotes
      WHERE updated_at >= date('now', '-30 days')
    `,
            )
            .get().count;

        // 热门标签（前10）- 从关联表实时统计
        const topTags = db
            .prepare(
                `
      SELECT t.id, t.name, COUNT(qt.quote_id) as count
      FROM tags t
      LEFT JOIN quote_tags qt ON t.id = qt.tag_id
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 10
    `,
            )
            .all()
            .map((tag) => ({
                id: tag.id,
                name: tag.name,
                count: tag.count,
            }));

        return {
            totalQuotes,
            totalTags,
            todayQuotes,
            weekQuotes,
            monthQuotes,
            topTags,
        };
    }
}

module.exports = new TagRepository();
