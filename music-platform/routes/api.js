const express = require('express');
const router = express.Router();
const musicService = require('../services/musicService');

// 搜索音乐列表
router.get('/search-1', async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({
                code: 400,
                message: '请提供搜索关键词'
            });
        }

        const result = await musicService.searchMusicList(keyword);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '搜索失败',
            error: error.message
        });
    }
});

// 获取音乐详情
router.get('/search-2', async (req, res) => {
    try {
        const { keyword, n } = req.query;
        if (!keyword || !n) {
            return res.status(400).json({
                code: 400,
                message: '请提供搜索关键词和序号'
            });
        }

        const result = await musicService.getMusicDetail(keyword, n);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取音乐详情失败',
            error: error.message
        });
    }
});

// 随机音乐
router.get('/random-1', async (req, res) => {
    try {
        const randomMusic = await musicService.getRandomMusic();
        if (randomMusic.code === 1) {
            const matchingSong = await musicService.findMatchingSong(
                randomMusic.data.name,
                randomMusic.data.artistsname
            );
            res.json(matchingSong);
        } else {
            res.status(500).json({
                code: 500,
                message: '获取随机音乐失败'
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取随机音乐失败',
            error: error.message
        });
    }
});

// 网易云随机音乐
router.get('/random-2', async (req, res) => {
    try {
        const neteaseMusic = await musicService.getNeteaseSong();
        if (neteaseMusic.code === 200) {
            const matchingSong = await musicService.findMatchingSong(
                neteaseMusic.data.song_name,
                neteaseMusic.data.artist
            );
            res.json(matchingSong);
        } else {
            res.status(500).json({
                code: 500,
                message: '获取网易云随机音乐失败'
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取网易云随机音乐失败',
            error: error.message
        });
    }
});

// 本地随机音乐
router.get('/random-3', async (req, res) => {
    try {
        const localRandomSong = await musicService.getLocalRandomSong();
        res.json(localRandomSong);
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取本地随机音乐失败',
            error: error.message
        });
    }
});

module.exports = router; 