document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('fullscreen-video');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.querySelector('.progress-bar');
    const progressFilled = document.getElementById('progress-filled');
    const timeDisplay = document.getElementById('time-display');
    const videoContainer = document.querySelector('.video-container');

    let controlsTimeout;
    let isControlsVisible = false;

    function showControls() {
        const controls = document.querySelector('.video-controls');
        controls.style.opacity = '1';
        isControlsVisible = true;
        clearTimeout(controlsTimeout);
        
        controlsTimeout = setTimeout(() => {
            if (!video.paused) {
                controls.style.opacity = '0';
                isControlsVisible = false;
            }
        }, 3000);
    }

    function togglePlayPause() {
        if (video.paused) {
            video.play();
            playPauseBtn.classList.add('playing');
            showControls();
        } else {
            video.pause();
            playPauseBtn.classList.remove('playing');
            showControls();
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function toggleMute() {
        video.muted = !video.muted;
        if (video.muted) {
            muteBtn.classList.add('muted');
            volumeSlider.value = 0;
        } else {
            muteBtn.classList.remove('muted');
            volumeSlider.value = video.volume * 100;
        }
    }

    function updateVolume() {
        video.volume = volumeSlider.value / 100;
        video.muted = volumeSlider.value === 0;
        
        if (video.muted) {
            muteBtn.classList.add('muted');
        } else {
            muteBtn.classList.remove('muted');
        }
    }

    function updateProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = percent + '%';
        
        const currentMinutes = Math.floor(video.currentTime / 60);
        const currentSeconds = Math.floor(video.currentTime % 60);
        const durationMinutes = Math.floor(video.duration / 60);
        const durationSeconds = Math.floor(video.duration % 60);
        
        const currentTimeString = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
        const durationTimeString = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
        
        timeDisplay.textContent = `${currentTimeString} / ${durationTimeString}`;
    }

    function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    }

    function handleKeyPress(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'm':
            case 'M':
                toggleMute();
                break;
            case 'ArrowUp':
                e.preventDefault();
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
                updateVolume();
                break;
            case 'ArrowDown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
                updateVolume();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                break;
        }
    }

    function handleMouseMove() {
        showControls();
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', updateVolume);
    progressBar.addEventListener('click', seek);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    document.addEventListener('keydown', handleKeyPress);
    videoContainer.addEventListener('mousemove', handleMouseMove);
    videoContainer.addEventListener('click', function(e) {
        if (e.target === video || e.target === videoContainer) {
            togglePlayPause();
        }
    });

    video.addEventListener('play', () => {
        playPauseBtn.classList.add('playing');
    });

    video.addEventListener('pause', () => {
        playPauseBtn.classList.remove('playing');
    });

    video.addEventListener('ended', () => {
        playPauseBtn.classList.remove('playing');
        if (video.loop) {
            video.play();
        }
    });

    volumeSlider.value = video.volume * 100;

    const videoSources = video.querySelectorAll('source');
    let videoLoaded = false;

    function loadVideo() {
        if (videoLoaded) return;
        
        for (let source of videoSources) {
            if (source.src) {
                video.load();
                videoLoaded = true;
                break;
            }
        }
        
        if (!videoLoaded) {
            const videoElement = document.createElement('div');
            videoElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                text-align: center;
                font-family: Arial, sans-serif;
                background: rgba(0, 0, 0, 0.8);
                padding: 40px;
                border-radius: 10px;
                max-width: 500px;
            `;
            videoElement.innerHTML = `
                <h2>Видео не найдено</h2>
                <p>Пожалуйста, поместите видеофайл в папку assets/video.mp4 или assets/video.webm</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                    Поддерживаемые форматы: MP4, WebM
                </p>
            `;
            videoContainer.appendChild(videoElement);
        }
    }

    video.addEventListener('error', loadVideo);
    setTimeout(loadVideo, 1000);

    showControls();
});
