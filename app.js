const express = require('express');
const path = require('path');
const axios = require('axios');
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

// 添加音频代理路由
app.get('/proxy-audio', async (req, res) => {
    try {
        const audioUrl = req.query.url;
        if (!audioUrl) {
            return res.status(400).send('缺少 URL 参数');
        }

        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream',
            timeout: 30000
        });

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        response.data.pipe(res);
    } catch (error) {
        console.error('音频代理错误:', error);
        res.status(500).send('获取音频失败');
    }
});

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