# 词摘 APP - 后端接口文档

> 技术栈：Koa + SQLite3
> 基础路径：`/api`
> 数据格式：JSON

---

## 一、接口概览

| 模块 | 接口             | 方法   | 说明             |
| ---- | ---------------- | ------ | ---------------- |
| 摘抄 | /quotes          | GET    | 获取摘抄列表     |
| 摘抄 | /quotes          | POST   | 创建摘抄         |
| 摘抄 | /quotes/:id      | GET    | 获取单个摘抄     |
| 摘抄 | /quotes/:id      | PUT    | 更新摘抄         |
| 摘抄 | /quotes/:id      | DELETE | 删除摘抄         |
| 标签 | /tags            | GET    | 获取所有标签     |
| 标签 | /tags/:id/quotes | GET    | 获取标签下的摘抄 |
| 标签 | /tags/rename     | PUT    | 重命名标签       |
| 统计 | /stats           | GET    | 获取统计数据     |

---

## 二、数据库设计

### 2.1 摘抄表 (quotes)

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_quotes_updated_at ON quotes(updated_at DESC);
```

### 2.2 标签表 (tags)

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_tags_count ON tags(count DESC);
CREATE INDEX idx_tags_name ON tags(name);
```

### 2.3 摘抄标签关联表 (quote_tags)

```sql
CREATE TABLE quote_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(quote_id, tag_id)
);

-- 索引
CREATE INDEX idx_quote_tags_quote_id ON quote_tags(quote_id);
CREATE INDEX idx_quote_tags_tag_id ON quote_tags(tag_id);
```

---

## 三、接口详情

### 3.1 摘抄接口

#### 3.1.1 获取摘抄列表

```
GET /api/quotes
```

**查询参数：**

| 参数     | 类型   | 必填 | 说明                                         |
| -------- | ------ | ---- | -------------------------------------------- |
| page     | number | 否   | 页码，默认 1                                 |
| pageSize | number | 否   | 每页数量，默认 20，最大 100                  |
| tags     | string | 否   | 标签筛选，多个标签用逗号分隔，如 `意境,诗句` |
| keyword  | string | 否   | 关键词搜索（模糊匹配 content）               |

**请求示例：**

```
GET /api/quotes?tags=意境,诗句&page=1&pageSize=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "content": "寒塘渡鹤影，冷月葬花魂。",
        "tags": ["意境", "诗句", "悲情"],
        "updatedAt": "2024-03-15T14:32:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 128,
      "totalPages": 13
    }
  }
}
```

**SQL 参考：**

```sql
-- 基础查询（默认按 updated_at 倒序）
SELECT * FROM quotes ORDER BY updated_at DESC LIMIT ? OFFSET ?;

-- 带标签筛选（交集）
SELECT q.* FROM quotes q
JOIN quote_tags qt ON q.id = qt.quote_id
JOIN tags t ON qt.tag_id = t.id
WHERE t.name IN ('意境', '诗句')
GROUP BY q.id
HAVING COUNT(DISTINCT t.name) = 2
ORDER BY q.updated_at DESC;

-- 关键词搜索
SELECT * FROM quotes WHERE content LIKE '%关键词%' ORDER BY updated_at DESC;
```

#### 3.1.2 创建摘抄

```
POST /api/quotes
```

**请求体：**

| 字段    | 类型   | 必填 | 说明                                |
| ------- | ------ | ---- | ----------------------------------- |
| content | string | 是   | 摘抄内容，1-5000字符                |
| tags    | array  | 否   | 标签名称数组，如 `["意境", "诗句"]` |

**请求示例：**

```json
{
  "content": "愿你出走半生，归来仍是少年。",
  "tags": ["祝福", "诗句"]
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2,
    "content": "愿你出走半生，归来仍是少年。",
    "tags": ["祝福", "诗句"],
    "updatedAt": "2024-03-15T14:32:00.000Z"
  }
}
```

**事务流程：**

```sql
BEGIN TRANSACTION;

-- 1. 插入摘抄
INSERT INTO quotes (content, updated_at) VALUES (?, CURRENT_TIMESTAMP);
SET @quote_id = LAST_INSERT_ROWID();

-- 2. 处理标签（对每个标签）
-- 2.1 查找或插入标签
INSERT OR IGNORE INTO tags (name, count) VALUES (?, 0);
UPDATE tags SET count = count + 1, last_used_at = CURRENT_TIMESTAMP WHERE name = ?;
SELECT id FROM tags WHERE name = ?;

-- 2.2 插入关联
INSERT INTO quote_tags (quote_id, tag_id) VALUES (@quote_id, ?);

COMMIT;
```

#### 3.1.3 获取单个摘抄

```
GET /api/quotes/:id
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "content": "寒塘渡鹤影，冷月葬花魂。",
    "tags": ["意境", "诗句", "悲情"],
    "updatedAt": "2024-03-15T14:32:00.000Z"
  }
}
```

**SQL 参考：**

```sql
SELECT q.*, GROUP_CONCAT(t.name) as tag_names
FROM quotes q
LEFT JOIN quote_tags qt ON q.id = qt.quote_id
LEFT JOIN tags t ON qt.tag_id = t.id
WHERE q.id = ?
GROUP BY q.id;
```

#### 3.1.4 更新摘抄

```
PUT /api/quotes/:id
```

**请求体：**

| 字段    | 类型   | 必填 | 说明                 |
| ------- | ------ | ---- | -------------------- |
| content | string | 否   | 摘抄内容             |
| tags    | array  | 否   | 标签数组（全量替换） |

**请求示例：**

```json
{
  "content": "寒塘渡鹤影，冷月葬花魂。",
  "tags": ["意境", "诗句", "红楼梦"]
}
```

**事务流程：**

```sql
BEGIN TRANSACTION;

-- 1. 更新摘抄内容和更新时间
UPDATE quotes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 2. 获取旧标签
SELECT t.id, t.name FROM tags t
JOIN quote_tags qt ON t.id = qt.tag_id
WHERE qt.quote_id = ?;

-- 3. 删除旧关联
DELETE FROM quote_tags WHERE quote_id = ?;

-- 4. 旧标签 count -1
UPDATE tags SET count = count - 1 WHERE id IN (旧标签IDs);

-- 5. 处理新标签（同创建逻辑）
-- ...

COMMIT;
```

#### 3.1.5 删除摘抄

```
DELETE /api/quotes/:id
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**事务流程：**

```sql
BEGIN TRANSACTION;

-- 1. 获取关联标签IDs
SELECT tag_id FROM quote_tags WHERE quote_id = ?;

-- 2. 删除关联
DELETE FROM quote_tags WHERE quote_id = ?;

-- 3. 标签 count -1
UPDATE tags SET count = count - 1 WHERE id IN (标签IDs);

-- 4. 删除 count=0 的标签（可选）
DELETE FROM tags WHERE count <= 0;

-- 5. 删除摘抄
DELETE FROM quotes WHERE id = ?;

COMMIT;
```

---

### 3.2 标签接口

#### 3.2.1 获取所有标签

```
GET /api/tags
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "意境",
      "count": 28,
      "lastUsedAt": "2024-03-15T14:32:00.000Z"
    },
    {
      "id": 2,
      "name": "诗句",
      "count": 15,
      "lastUsedAt": "2024-03-14T10:20:00.000Z"
    }
  ]
}
```

**SQL：**

```sql
SELECT * FROM tags ORDER BY count DESC, name ASC;
```

#### 3.2.2 获取标签下的摘抄

```
GET /api/tags/:id/quotes
```

**说明：** 返回包含该标签的所有摘抄，支持分页参数（同 3.1.1）

**SQL 参考：**

```sql
SELECT q.*, GROUP_CONCAT(t2.name) as tags
FROM quotes q
JOIN quote_tags qt ON q.id = qt.quote_id
JOIN tags t ON qt.tag_id = t.id
LEFT JOIN quote_tags qt2 ON q.id = qt2.quote_id
LEFT JOIN tags t2 ON qt2.tag_id = t2.id
WHERE t.id = ?
GROUP BY q.id
ORDER BY q.updated_at DESC
LIMIT ? OFFSET ?;
```

#### 3.2.3 重命名标签

```
PUT /api/tags/rename
```

**请求体：**

| 字段    | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| oldName | string | 是   | 原标签名 |
| newName | string | 是   | 新标签名 |

**请求示例：**

```json
{
  "oldName": "好看",
  "newName": "修辞"
}
```

**业务逻辑：**

- 新标签名已存在时，合并两个标签（count 相加，关联合并）
- 新标签名不存在时，直接修改标签名

**SQL 参考：**

```sql
-- 情况1：新标签已存在，合并
BEGIN TRANSACTION;

-- 获取两个标签的ID和count
SELECT id, count FROM tags WHERE name IN ('旧名', '新名');

-- 更新引用旧标签的关联到新标签（忽略冲突）
UPDATE OR IGNORE quote_tags SET tag_id = 新ID WHERE tag_id = 旧ID;

-- 删除重复的关联
DELETE FROM quote_tags WHERE tag_id = 旧ID;

-- 更新新标签 count
UPDATE tags SET count = 旧count + 新count WHERE id = 新ID;

-- 删除旧标签
DELETE FROM tags WHERE id = 旧ID;

COMMIT;

-- 情况2：新标签不存在，直接改名
UPDATE tags SET name = '新名' WHERE name = '旧名';
```

---

### 3.3 统计接口

#### 3.3.1 获取统计数据

```
GET /api/stats
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalQuotes": 128,
    "totalTags": 24,
    "todayQuotes": 3,
    "weekQuotes": 15,
    "monthQuotes": 42,
    "topTags": [
      { "id": 1, "name": "意境", "count": 28 },
      { "id": 2, "name": "诗句", "count": 15 },
      { "id": 3, "name": "描写", "count": 12 }
    ]
  }
}
```

**SQL 参考：**

```sql
-- 总摘抄数
SELECT COUNT(*) FROM quotes;

-- 总标签数
SELECT COUNT(*) FROM tags;

-- 今日新增
SELECT COUNT(*) FROM quotes
WHERE date(updated_at) = date('now');

-- 本周新增
SELECT COUNT(*) FROM quotes
WHERE updated_at >= date('now', '-7 days');

-- 本月新增
SELECT COUNT(*) FROM quotes
WHERE updated_at >= date('now', '-30 days');

-- 热门标签
SELECT * FROM tags ORDER BY count DESC LIMIT 10;
```

## 四、通用响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": -1,
  "message": "参数错误：content 不能为空",
  "data": null
}
```

## 五、更新数据库相关目录

更新数据库相关目录

```
src/
├── config/
│   └── database.js     # SQLite 配置
├── models/
    └── db.js           # 数据库连接和初始化
```

---

## 六、关键实现代码

### 6.1 数据库初始化

```javascript
// 初始化表
const initDB = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS quote_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(quote_id, tag_id)
      )
    `);

    // 创建索引
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_quotes_updated ON quotes(updated_at DESC)",
    );
    db.run("CREATE INDEX IF NOT EXISTS idx_tags_count ON tags(count DESC)");
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_quote_tags_quote ON quote_tags(quote_id)",
    );
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_quote_tags_tag ON quote_tags(tag_id)",
    );
  });
};

module.exports = { db, initDB };
```

---

## 开发注意事项

1. **事务处理**：涉及多表操作必须使用事务，保证数据一致性
2. **SQL 注入**：所有参数使用占位符 `?`，禁止字符串拼接 SQL
3. **并发控制**：SQLite 支持 WAL 模式，可处理并发读写
4. **空标签过滤**：创建/更新时过滤掉空字符串标签
5. **关联清理**：删除摘抄时 CASCADE 会自动清理 quote_tags 关联
