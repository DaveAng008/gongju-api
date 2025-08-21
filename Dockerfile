# 使用官方的 Node.js 18 镜像作为基础
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目源代码
COPY . .

# 暴露 API 服务运行的端口
EXPOSE 3001

# 容器启动时运行的命令
CMD [ "node", "index.js" ]