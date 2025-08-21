const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // 引入我们的数据库连接模块

const app = express();
const PORT = 3001; // API 服务将运行在这个端口
// 这个密钥非常重要，用于签发和验证 token，请务必更换成一个复杂且随机的字符串
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_that_is_long_and_random_12345';

// 中间件设置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 格式的请求体

// === 用户注册 API 接口 (/api/register) ===
app.post('/api/register', async (req, res) => {
  const { username, email, password, phone } = req.body;

  // 1. 后端数据验证
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: '所有字段均为必填项' });
  }

  try {
    // 2. 检查用户或邮箱是否已存在
    const [existingUser] = await db.query('SELECT email FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: '邮箱或用户名已存在' });
    }

    // 3. 密码加密
    const hashedPassword = await bcrypt.hash(password, 10); // 使用 bcrypt 对密码进行加盐哈希

    // 4. 将新用户数据插入数据库
    await db.query('INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, phone]);

    // 5. 返回成功响应
    res.status(201).json({ message: '用户注册成功' });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// === 用户登录 API 接口 (/api/login) ===
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '邮箱和密码是必填项' });
    }

    try {
        // 1. 根据邮箱在数据库中查找用户
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // 为了安全，不明确提示是邮箱还是密码错误
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        const user = users[0];

        // 2. 比较用户输入的密码和数据库中存储的哈希密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        // 3. 密码匹配成功，创建 JSON Web Token (JWT)
        const token = jwt.sign(
            { userId: user.id, username: user.username }, // 在 token 中存储一些非敏感的用户信息
            JWT_SECRET,
            { expiresIn: '1d' } // Token 有效期设置为 1 天
        );
        
        // 4. 登录成功，返回 token 和一些用户信息给前端
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});