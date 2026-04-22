// db/init.js
const { getDB } = require("./db");

function initDatabase() {
  const db = getDB();

  try {
    // 创建摘抄表 (quotes)
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created quotes table");

    // 创建标签表 (tags)
    db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created tags table");

    // 创建摘抄标签关联表 (quote_tags)
    db.exec(`
      CREATE TABLE IF NOT EXISTS quote_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(quote_id, tag_id)
      )
    `);
    console.log("✅ Created quote_tags table");

    // 创建索引以优化查询性能
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_quotes_updated_at ON quotes(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_quote_tags_quote_id ON quote_tags(quote_id);
      CREATE INDEX IF NOT EXISTS idx_quote_tags_tag_id ON quote_tags(tag_id);
    `);
    console.log("✅ Created indexes");

    console.log("🎉 Database initialization completed");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    throw error; // 抛出错误让调用方感知
  }
}

// 如果直接运行此脚本，执行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
