const express = require('express');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const apiRoutes = require('./routes/api');

const app = express();

// 添加 JSON 解析中间件
app.use(express.json());

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/pages'));

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'src/pages')));

// 使用路由
app.use('/', routes);
app.use('/api', apiRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).send('页面未找到');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});