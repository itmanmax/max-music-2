const audioPlayer = document.getElementById('audioPlayer');
const songCover = document.getElementById('songCover');
const songNameDisplay = document.getElementById('songName');
const artistNameDisplay = document.getElementById('artistName');
const vinylDisc = document.getElementById('vinylDisc');

async function searchSongs() {
    const keyword = document.getElementById('searchInput').value;
    if (!keyword) return;

    try {
        document.getElementById('searchResults').innerHTML = '';
        const response = await fetch(`/api/search-1?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        if (data.code === 0) {
            displaySearchResults(data.data);
        } else {
            alert('搜索失败：' + data.msg);
        }
    } catch (error) {
        console.error('搜索出错：', error);
        alert('搜索出错，请稍后重试');
    }
}

function displaySearchResults(songs) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = songs.map((song, index) => `
        <div class="song-item" onclick="playSong('${encodeURIComponent(song.songname)}', ${index + 1})">
            <h3>${song.songname}</h3>
            <p>${song.name} · ${song.album}</p>
        </div>
    `).join('');
}

async function playSong(songName, index) {
    try {
        const response = await fetch(`/api/search-2?keyword=${songName}&n=${index}`);
        const data = await response.json();
        
        if (data.code === 0) {
            const songInfo = data.data;
            
            songCover.src = songInfo.cover;
            songNameDisplay.textContent = songInfo.songname;
            artistNameDisplay.textContent = songInfo.name;
            
            audioPlayer.src = songInfo.src;
            audioPlayer.play();
        } else {
            alert('获取歌曲失败：' + data.msg);
        }
    } catch (error) {
        console.error('播放出错：', error);
        alert('播放出错，请稍后重试');
    }
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

// 监听回车键搜索
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchSongs();
    }
});

// 监听音频播放状态
audioPlayer.addEventListener('play', () => {
    vinylDisc.classList.add('playing');
});

audioPlayer.addEventListener('pause', () => {
    vinylDisc.classList.remove('playing');
});

audioPlayer.addEventListener('ended', () => {
    vinylDisc.classList.remove('playing');
});
