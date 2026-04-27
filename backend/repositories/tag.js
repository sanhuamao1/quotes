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

    deleteTag(tagId) {
        const stmts = this._getPreparedStatements();

        const tag = stmts.selectTagById.get(tagId);
        if (!tag) {
            throw new BusinessError(`标签 ID "${tagId}" 不存在`, -1, 404);
        }

        stmts.deleteTag.run(tagId);
        return { id: tagId };
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
}

module.exports = new TagRepository();
