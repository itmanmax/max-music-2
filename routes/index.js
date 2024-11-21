const express = require('express');
const router = express.Router();

// 重定向根路径到首页
router.get('/', (req, res) => {
    res.redirect('/home');
});

// 首页路由
router.get('/home', (req, res) => {
    res.render('home/index');
});

// 搜索页面路由
router.get('/search', (req, res) => {
    res.render('search/index');
});

// 随机播放页面路由
router.get('/random', (req, res) => {
    res.render('random/index');
});

module.exports = router; 