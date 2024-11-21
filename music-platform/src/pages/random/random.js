let currentPlaylist = [];
let currentIndex = 0;
let isLoading = true;
let nextSongPreloaded = false;

// 获取DOM元素
const audioPlayer = document.getElementById('audioPlayer');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const loadingOverlay = document.getElementById('loadingOverlay');
const songCover = document.getElementById('songCover');
const songName = document.getElementById('songName');
const artistName = document.getElementById('artistName');
const playButton = document.getElementById('playButton');

// 从不同API获取歌曲
async function fetchSongFromAPI(apiNumber) {
    try {
        const response = await fetch(`/api/random-${apiNumber}`);
        const data = await response.json();
        
        if ((apiNumber === 1 && data.code === 0) || 
            (apiNumber === 2 && data.code === 0) || 
            (apiNumber === 3 && data.code === 0)) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error(`API-${apiNumber}获取失败:`, error);
        return null;
    }
}

// 检查歌曲是否重复
function isDuplicateSong(newSong) {
    return currentPlaylist.some(song => 
        song.title === newSong.title && 
        song.artist === newSong.artist
    );
}

// 修改添加歌曲的方法
async function addNewSongToPlaylist() {
    let attempts = 0;
    const maxAttempts = 10; // 最多尝试5次获取不重复的歌曲
    
    while (attempts < maxAttempts) {
        try {
            let song = await fetchSongFromAPI(3);
            
            if (!song) {
                song = await fetchSongFromAPI(4);
            }
            
            if (!song) {
                song = await fetchSongFromAPI(5);
            }
            
            if (!song) {
                throw new Error('所有API都无法获取歌曲');
            }

            const newSong = {
                title: song.songname || song.name,
                artist: song.artist || song.name,
                cover: song.cover || song.picurl || '/images/default-cover.jpg',
                url: song.src || song.url,
                duration: 0
            };

            // 检查是否重复
            if (!isDuplicateSong(newSong)) {
                currentPlaylist.push(newSong);
                updatePlaylistUI();
                return;
            }

            attempts++;
        } catch (error) {
            console.error('获取歌曲失败，尝试重新获取', error);
            attempts++;
        }
    }

    throw new Error('无法获取不重复的歌曲');
}

// 更新播放列表UI
function updatePlaylistUI() {
    const playlistContainer = document.querySelector('.playlist-container');
    playlistContainer.innerHTML = currentPlaylist.map((song, index) => `
        <div class="song-item ${index === currentIndex ? 'playing' : ''}" 
             onclick="playSongAtIndex(${index})">
            <img src="${song.cover}" alt="封面" class="song-cover">
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            ${index === currentIndex ? '<span class="playing-indicator">▶</span>' : ''}
        </div>
    `).join('');
}

// 播放指定索引的歌曲
function playSongAtIndex(index) {
    if (index >= 0 && index < currentPlaylist.length) {
        currentIndex = index;
        const song = currentPlaylist[index];
        
        songCover.src = song.cover;
        songName.textContent = song.title;
        artistName.textContent = song.artist;
        audioPlayer.src = song.url;
        audioPlayer.play();
        
        updatePlaylistUI();
        updatePlayButton();
    }
}

// 播放上一首
function playPrevious() {
    if (currentIndex > 0) {
        playSongAtIndex(currentIndex - 1);
    }
}

// 播放下一首
async function playNext() {
    if (currentIndex < currentPlaylist.length - 1) {
        playSongAtIndex(currentIndex + 1);
    } else {
        await addNewSongToPlaylist();
        playSongAtIndex(currentIndex + 1);
    }
}

// 切换播放/暂停
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updatePlayButton();
}

// 更新播放按钮状态
function updatePlayButton() {
    playButton.innerHTML = `<i>${audioPlayer.paused ? '▶' : '⏸'}</i>`;
}

// 更新进度条
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);
    
    if ((currentTime / duration) > 0.8 && !nextSongPreloaded) {
        preloadNextSong();
        nextSongPreloaded = true;
    }
}

// 格式化时间
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 预加载下一首歌
async function preloadNextSong() {
    if (currentIndex === currentPlaylist.length - 2) {
        await addNewSongToPlaylist();
        if (currentIndex === 3) {
            currentPlaylist = [
                ...currentPlaylist.slice(currentIndex),
                ...currentPlaylist.slice(0, currentIndex)
            ];
            currentIndex = 0;
            updatePlaylistUI();
        }
    }
}

// 修改初始化方法，添加错误重试
async function initializePlaylist() {
    try {
        loadingOverlay.style.display = 'flex';
        
        for (let i = 0; i < 5; i++) {
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    await addNewSongToPlaylist();
                    document.querySelector('.loading-text').textContent = 
                        `正在加载歌曲... ${i + 1}/5`;
                    break;
                } catch (error) {
                    retryCount++;
                    if (retryCount === maxRetries) {
                        throw error;
                    }
                    console.log(`重试第 ${retryCount} 次`);
                }
            }
        }
        
        if (currentPlaylist.length > 0) {
            playSongAtIndex(0);
        }
        
        isLoading = false;
        loadingOverlay.style.display = 'none';
    } catch (error) {
        console.error('初始化播放列表失败:', error);
        loadingOverlay.style.display = 'none';
        alert('加载歌曲失败，请刷新页面重试');
    }
}

// 进度条点击和拖动事件
progressBar.addEventListener('click', (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
});

let isDragging = false;
const progressHandle = document.querySelector('.progress-handle');

progressHandle.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        progress.style.width = `${percent * 100}%`;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// 音频事件监听
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', () => {
    nextSongPreloaded = false;
    playNext();
});
audioPlayer.addEventListener('play', updatePlayButton);
audioPlayer.addEventListener('pause', updatePlayButton);

// 初始化页面
initializePlaylist(); 