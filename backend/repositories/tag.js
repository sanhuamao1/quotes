const { getDB } = require("../db/db");

class TagRepository {
  _getPreparedStatements() {
    const db = getDB();
    if (this._stmts) return this._stmts;

    this._stmts = {
      selectAllTags: db.prepare("SELECT id, name, last_used_at FROM tags ORDER BY name ASC"),
      selectTagByName: db.prepare("SELECT id, name FROM tags WHERE name = ?"),
      selectTagById: db.prepare("SELECT id, name FROM tags WHERE id = ?"),
      updateTagName: db.prepare("UPDATE tags SET name = ? WHERE name = ?"),
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

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      count: tag.count,
      lastUsedAt: tag.last_used_at,
    }));
  }

  renameTag(oldName, newName) {
    const db = getDB();
    const stmts = this._getPreparedStatements();

    const transaction = db.transaction(() => {
      // 1. 检查旧标签是否存在
      const oldTag = stmts.selectTagByName.get(oldName);
      if (!oldTag) {
        throw new Error(`标签 "${oldName}" 不存在`);
      }

      // 2. 检查新标签是否已存在
      const newTag = stmts.selectTagByName.get(newName);

      if (newTag) {
        // 情况1：新标签已存在，合并两个标签
        // 2.1 更新引用旧标签的关联到新标签
        db.prepare(`
          UPDATE OR IGNORE quote_tags
          SET tag_id = ?
          WHERE tag_id = ?
        `).run(newTag.id, oldTag.id);

        // 2.2 删除重复的关联
        db.prepare(`
          DELETE FROM quote_tags
          WHERE tag_id = ?
        `).run(oldTag.id);

        // 2.3 更新新标签最后使用时间
        stmts.updateTagLastUsed.run(newTag.id);

        // 2.4 删除旧标签
        stmts.deleteTag.run(oldTag.id);
      } else {
        // 情况2：新标签不存在，直接改名
        stmts.updateTagName.run(newName, oldName);
        // 更新标签最后使用时间
        stmts.updateTagLastUsed.run(oldTag.id);
      }

      return true;
    });

    return transaction();
  }

  getStats() {
    const db = getDB();

    // 总摘抄数
    const totalQuotes = db.prepare("SELECT COUNT(*) as count FROM quotes").get().count;

    // 总标签数
    const totalTags = db.prepare("SELECT COUNT(*) as count FROM tags").get().count;

    // 今日新增
    const todayQuotes = db.prepare(`
      SELECT COUNT(*) as count
      FROM quotes
      WHERE date(updated_at) = date('now')
    `).get().count;

    // 本周新增
    const weekQuotes = db.prepare(`
      SELECT COUNT(*) as count
      FROM quotes
      WHERE updated_at >= date('now', '-7 days')
    `).get().count;

    // 本月新增
    const monthQuotes = db.prepare(`
      SELECT COUNT(*) as count
      FROM quotes
      WHERE updated_at >= date('now', '-30 days')
    `).get().count;

    // 热门标签（前10）- 从关联表实时统计
    const topTags = db.prepare(`
      SELECT t.id, t.name, COUNT(qt.quote_id) as count
      FROM tags t
      LEFT JOIN quote_tags qt ON t.id = qt.tag_id
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 10
    `).all().map(tag => ({
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