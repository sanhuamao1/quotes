# Koa Backend for Record and Tag Management

## 项目简介

这是一个基于 Koa 框架的后端服务，用于管理记录和标签。支持记录的创建、更新、删除和查询，以及标签的自动解析和管理。

## 技术栈

- Node.js
- Koa 2
- @koa/router
- better-sqlite3

## 数据库结构

### 记录表 (records)

| 字段名     | 类型        | 说明                                                    |
| ---------- | ----------- | ------------------------------------------------------- |
| id         | TEXT (主键) | 每条记录的唯一标识 (短ID)                               |
| content    | TEXT        | 记录的原始文本，例如 "今天学习了数据库设计 #学习 #笔记" |
| updated_at | TIMESTAMP   | 更新时间                                                |

### 标签表 (tags)

| 字段名 | 类型        | 说明                                      |
| ------ | ----------- | ----------------------------------------- |
| id     | TEXT (主键) | 标签的唯一标识 (短ID)                     |
| name   | VARCHAR(50) | 标签名称，如 "学习"、"笔记"，设置唯一约束 |

### 关联表 (record_tags)

| 字段名    | 类型        | 说明                 |
| --------- | ----------- | -------------------- |
| record_id | TEXT (外键) | 指向 records 表的 id |
| tag_id    | TEXT (外键) | 指向 tags 表的 id    |

## 接口文档

### 记录相关接口

#### 1. 获取记录列表

- **请求方法**: GET
- **URL**: `/records`
- **查询参数**:
    - `tagIds` (可选): 标签 ID 列表，使用逗号分隔的字符串格式（如 "id1,id2"），用于按标签筛选记录
    - `keyword` (可选): 关键字，用于按内容搜索记录
- **响应格式**:
    ```json
    {
        "code": 0,
        "message": "success",
        "data": [
            {
                "id": "mo89ock79gukjk",
                "content": "今天学习了数据库设计 #学习 #笔记",
                "updated_at": "2026-04-20 16:00:00",
                "tags": [
                    { "id": "mo89ock80u3wbo", "name": "学习" },
                    { "id": "mo89ock9etegq4", "name": "笔记" }
                ]
            }
        ]
    }
    ```

#### 2. 创建记录

- **请求方法**: POST
- **URL**: `/records`
- **请求体**:
    ```json
    {
        "content": "今天学习了 Koa 框架 #学习 #后端"
    }
    ```
- **响应格式**:
    ```json
    {
        "code": 0,
        "message": "记录创建成功",
        "data": {
            "id": "mo8ajxax8ztzw6",
            "tags": ["标签ID1", "标签ID2"]
        }
    }
    ```
- **说明**: 系统会自动解析内容中的标签（格式如 `#学习 `，以 # 开头，以空格结尾），创建不存在的标签，并建立记录与标签的关联。

#### 3. 更新记录

- **请求方法**: PUT
- **URL**: `/records/:id`
- **请求体**:
    ```json
    {
        "content": "今天学习了 Express 框架 #学习 #后端"
    }
    ```
- **响应格式**:
    ```json
    {
        "code": 0,
        "message": "记录更新成功",
        "data": {
            "id": "mo8ajxax8ztzw6",
            "tags": ["标签1", "标签2"]
        }
    }
    ```
- **说明**: 系统会自动重新解析内容中的标签，更新标签关联。

#### 4. 删除记录

- **请求方法**: DELETE
- **URL**: `/records/:id`
- **响应格式**:
    ```json
    {
        "code": 0,
        "message": "记录删除成功",
        "data": {
            "success": true
        }
    }
    ```
- **说明**: 系统会自动删除记录与标签的关联。

### 标签相关接口

#### 1. 获取标签列表

- **请求方法**: GET
- **URL**: `/tags`
- **响应格式**:
    ```json
    {
        "code": 0,
        "message": "success",
        "data": [
            { "id": "mo89ock80u3wbo", "name": "学习" },
            { "id": "mo89ock9etegq4", "name": "笔记" },
            { "id": "mo89r6gc8553qg", "name": "后端" }
        ]
    }
    ```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start
```

服务将运行在 http://localhost:3000

## 注意事项

- 标签解析规则：以 `#` 开头，以空格结尾，中间的内容为标签名
- 数据库使用 SQLite，数据存储在 `finance.db` 文件中
- 系统会自动创建数据库表结构，无需手动初始化
