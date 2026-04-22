# 使用 Node.js 18 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

RUN echo "http://mirrors.aliyun.com/alpine/v3.18/main" > /etc/apk/repositories && \
    echo "http://mirrors.aliyun.com/alpine/v3.18/community" >> /etc/apk/repositories && \
    apk update

# 安装构建依赖（用于编译 better-sqlite3）
RUN apk add --no-cache python3 make g++

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建数据库目录（如果不存在）
RUN mkdir -p /app/db

# 启动应用
CMD ["node", "app.js"]
