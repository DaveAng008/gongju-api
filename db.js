const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
  // 最佳实践：使用环境变量来存储敏感信息
  // Portainer 将会把您在界面上填写的环境变量注入到这里
  host: process.env.DB_HOST || 'mysql-db', // 数据库容器的名称
  user: process.env.DB_USER || 'your_db_user', // 替换成您的数据库用户名
  password: process.env.DB_PASSWORD || 'your_db_password', // 替换成您的数据库密码
  database: process.env.DB_NAME || 'your_db_name', // 替换成您的数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 导出 promise 化的查询功能，方便使用 async/await
module.exports = pool.promise();