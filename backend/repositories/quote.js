const { getDB } = require("../db/db");

class QuoteRepository {
    // ---------- 基础查询语句（预编译缓存） ----------
    _getPreparedStatements() {
        const db = getDB();
        if (this._stmts) return this._stmts;

        this._stmts = {
            // quotes 表操作
            insertQuote: db.prepare("INSERT INTO quotes (content) VALUES (?)"),
            updateQuote: db.prepare(
                "UPDATE quotes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            ),
            deleteQuote: db.prepare("DELETE FROM quotes WHERE id = ?"),

            // tags 表操作
            selectTagByName: db.prepare("SELECT id FROM tags WHERE name = ?"),
            insertTag: db.prepare(
                "INSERT OR IGNORE INTO tags (name) VALUES (?)",
            ),
            updateTagLastUsed: db.prepare(
                "UPDATE tags SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?",
            ),

            // quote_tags 表操作
            deleteQuoteTags: db.prepare(
                "DELETE FROM quote_tags WHERE quote_id = ?",
            ),
            insertQuoteTag: db.prepare(
                "INSERT OR IGNORE INTO quote_tags (quote_id, tag_id) VALUES (?, ?)",
            ),
        };
        return this._stmts;
    }

    // ---------- 事务：创建摘抄 + 标签关联 ----------
    createQuoteWithTags(content, tagIds = [], newTagsName = []) {
        const db = getDB();
        const stmts = this._getPreparedStatements();

        const transaction = db.transaction(() => {
            // 1. 插入摘抄
            const { lastInsertRowid: quoteId } = stmts.insertQuote.run(content);

            // 3. 处理新标签（通过newTagsName）
            for (const tagName of newTagsName) {
                stmts.insertTag.run(tagName);
                const { id: newTagId } = stmts.selectTagByName.get(tagName);
                stmts.updateTagLastUsed.run(newTagId);
                stmts.insertQuoteTag.run(quoteId, newTagId);
            }

            // 4. 处理已存在标签的最后使用时间
            for (const tagId of tagIds) {
                stmts.updateTagLastUsed.run(tagId);
                stmts.insertQuoteTag.run(quoteId, tagId);
            }

            return { quoteId, tagIds };
        });

        try {
            const result = transaction();
            return result;
        } catch (error) {
            console.error("创建摘抄失败:", error);
            throw error;
        }
    }

    // ---------- 事务：更新摘抄及标签 ----------
    updateQuoteWithTags(id, content, tagIds = [], newTagsName = []) {
        const db = getDB();
        const stmts = this._getPreparedStatements();

        const transaction = db.transaction(() => {
            // 1. 更新摘抄内容
            const result = stmts.updateQuote.run(content, id);
            if (result.changes === 0) {
                throw new Error(`摘抄 ID ${id} 不存在`);
            }

            // 2. 删除原有标签关联
            stmts.deleteQuoteTags.run(id);

            // 3. 处理新标签（通过newTagsName）
            for (const tagName of newTagsName) {
                stmts.insertTag.run(tagName);
                const { id: newTagId } = stmts.selectTagByName.get(tagName);
                tagIds.push(newTagId);
            }

            for (const tagId of tagIds) {
                stmts.insertQuoteTag.run(id, tagId);
                stmts.updateTagLastUsed.run(tagId);
            }

            return result.changes;
        });

        return transaction();
    }

    // ---------- 事务：删除摘抄 ----------
    deleteQuote(id) {
        const db = getDB();
        const stmts = this._getPreparedStatements();

        const transaction = db.transaction(() => {
            // 1. 获取关联标签
            const tags = db
                .prepare(
                    `
        SELECT tag_id FROM quote_tags WHERE quote_id = ?
      `,
                )
                .all(id);

            // 2. 删除关联
            stmts.deleteQuoteTags.run(id);

            // 3. 标签处理（不再需要更新 count）

            // 5. 删除摘抄
            const result = stmts.deleteQuote.run(id);
            return result.changes;
        });

        return transaction();
    }

    // ---------- 查询：基础摘抄列表（不含标签） ----------
    getQuotesBase({ page = 1, pageSize = 20, tagIds, keyword }) {
        const db = getDB();
        let sql = "SELECT q.* FROM quotes q";
        const params = [];
        const offset = (page - 1) * pageSize;

        // 处理标签ID筛选（交集）
        if (tagIds && tagIds.length > 0) {
            const placeholders = tagIds.map(() => "?").join(",");
            sql = `
        SELECT q.* FROM quotes q
        JOIN quote_tags qt ON q.id = qt.quote_id
        WHERE qt.tag_id IN (${placeholders})
      `;
            params.push(...tagIds);

            // 添加 GROUP BY 和 HAVING 确保包含所有指定标签
            sql += ` GROUP BY q.id HAVING COUNT(DISTINCT qt.tag_id) = ${tagIds.length}`;
        } else if (keyword) {
            sql = "SELECT q.* FROM quotes q WHERE q.content LIKE ?";
            params.push(`%${keyword}%`);
        }

        // 总计数查询
        const countSql = sql.replace(
            "SELECT q.*",
            "SELECT COUNT(DISTINCT q.id) as total",
        );
        const countResult = db.prepare(countSql).get(...params);
        const total = countResult ? countResult.total : 0;

        // 添加排序和分页
        sql += " ORDER BY q.updated_at DESC LIMIT ? OFFSET ?";
        params.push(pageSize, offset);

        const quotes = db.prepare(sql).all(...params);

        return {
            quotes,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    getTagsForQuotes(quoteIds) {
        if (quoteIds.length === 0) return new Map();

        const db = getDB();
        const placeholders = quoteIds.map(() => "?").join(",");
        const sql = `
      SELECT qt.quote_id, t.id, t.name
      FROM tags t
      JOIN quote_tags qt ON t.id = qt.tag_id
      WHERE qt.quote_id IN (${placeholders})
    `;
        const stmt = db.prepare(sql);
        const rows = stmt.all(...quoteIds);

        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.quote_id)) {
                map.set(row.quote_id, []);
            }
            map.get(row.quote_id).push({ id: row.id, name: row.name });
        }
        return map;
    }

    getQuotesWithTags({ page = 1, pageSize = 20, tagIds, keyword }) {
        const { quotes, pagination } = this.getQuotesBase({
            page,
            pageSize,
            tagIds,
            keyword,
        });
        if (quotes.length === 0) {
            return {
                list: [],
                pagination,
            };
        }

        const ids = quotes.map((q) => q.id);
        const tagsMap = this.getTagsForQuotes(ids);

        const list = quotes.map((quote) => ({
            id: quote.id,
            content: quote.content,
            tags: tagsMap.get(quote.id) || [],
            updatedAt: quote.updated_at,
        }));

        return {
            list,
            pagination,
        };
    }

    getQuotesBaseForExport({ tagIds }) {
        const db = getDB();
        let sql = "SELECT q.* FROM quotes q";
        const params = [];

        if (tagIds && tagIds.length > 0) {
            const placeholders = tagIds.map(() => "?").join(",");
            sql = `
        SELECT q.* FROM quotes q
        JOIN quote_tags qt ON q.id = qt.quote_id
        WHERE qt.tag_id IN (${placeholders})
      `;
            params.push(...tagIds);
            sql += ` GROUP BY q.id HAVING COUNT(DISTINCT qt.tag_id) = ${tagIds.length}`;
        }

        sql += " ORDER BY q.updated_at DESC";
        return db.prepare(sql).all(...params);
    }

    getQuotesWithTagsForExport({ tagIds }) {
        const quotes = this.getQuotesBaseForExport({ tagIds });
        if (quotes.length === 0) return [];

        const ids = quotes.map((q) => q.id);
        const tagsMap = this.getTagsForQuotes(ids);

        return quotes.map((quote) => ({
            content: quote.content,
            tags: tagsMap.get(quote.id) || [],
            updatedAt: quote.updated_at,
        }));
    }
}

module.exports = new QuoteRepository();
