const axios = require('axios');
require('dotenv').config();
const localMusicList = require('../data/localMusicList');

const musicService = {
    // 搜索音乐列表
    async searchMusicList(songName) {
        try {
            const response = await axios.get(process.env.QQ_MUSIC_API_BASE_URL, {
                params: {
                    name: songName,
                    uin: process.env.QQ_MUSIC_UIN,
                    skey: process.env.QQ_MUSIC_SKEY,
                    max: 10
                }
            });
            return response.data;
        } catch (error) {
            console.error('搜索音乐列表失败:', error);
            throw error;
        }
    },

    // 获取具体音乐详情
    async getMusicDetail(songName, index) {
        try {
            const response = await axios.get(process.env.QQ_MUSIC_API_BASE_URL, {
                params: {
                    name: songName,
                    uin: process.env.QQ_MUSIC_UIN,
                    skey: process.env.QQ_MUSIC_SKEY,
                    n: index,
                    max: 10
                }
            });
            
            // 修改返回数据中的音频URL
            if (response.data.code === 0 && response.data.data && response.data.data.src) {
                response.data.data.src = `/proxy-audio?url=${encodeURIComponent(response.data.data.src)}`;
            }
            
            return response.data;
        } catch (error) {
            console.error('获取音乐详情失败:', error);
            throw error;
        }
    },

    // 获取随机音乐
    async getRandomMusic() {
        try {
            const response = await axios.get('https://api.uomg.com/api/rand.music', {
                params: {
                    sort: '热歌榜',
                    format: 'json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取随机音乐失败:', error);
            throw error;
        }
    },

    // 获取网易云随机音乐
    async getNeteaseSong() {
        try {
            const response = await axios.get('https://api.cenguigui.cn/api/netease/');
            return response.data;
        } catch (error) {
            console.error('获取网易云随机音乐失败:', error);
            throw error;
        }
    },

    // 查找匹配的歌曲（优化版）
    async findMatchingSong(songName, artistName) {
        try {
            // 先用歌名搜索
            const searchResult = await this.searchMusicList(songName);
            
            if (searchResult.code === 0 && searchResult.data.length > 0) {
                // 尝试找到匹配歌手的歌曲（不区分大小写，去除空格）
                const matchingSong = searchResult.data.find(song => 
                    song.name.toLowerCase().replace(/\s+/g, '') === 
                    artistName.toLowerCase().replace(/\s+/g, '')
                );
                
                // 如果找到匹配的歌手，返回对应索引+1
                if (matchingSong) {
                    const index = searchResult.data.indexOf(matchingSong) + 1;
                    return await this.getMusicDetail(songName, index);
                }
                
                // 如果没找到匹配的歌手，使用第一个结果
                return await this.getMusicDetail(songName, 1);
            }
            
            throw new Error('未找到相关歌曲');
        } catch (error) {
            console.error('查找匹配歌曲失败:', error);
            throw error;
        }
    },

    // 获取本地随机音乐
    async getLocalRandomSong() {
        try {
            // 随机选择一首歌
            const randomIndex = Math.floor(Math.random() * localMusicList.length);
            const randomSong = localMusicList[randomIndex];
            
            // 使用选中的歌曲信息搜索匹配的歌手
            return await this.findMatchingSong(randomSong.name, randomSong.artist);
        } catch (error) {
            console.error('获取本地随机音乐失败:', error);
            throw error;
        }
    }
};

module.exports = musicService; 