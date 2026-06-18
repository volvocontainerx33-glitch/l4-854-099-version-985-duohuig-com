(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-video-src');

    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attach() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，点击播放。');
        });

        hls.on(window.Hls.Events.ERROR, function (_event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            setStatus('当前播放源暂时无法载入。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪，点击播放。');
      } else {
        setStatus('正在加载 HLS 播放组件。');
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
          .then(attach)
          .catch(function () {
            video.src = source;
            setStatus('浏览器会尝试直接播放 m3u8 源。');
          });
      }
    }

    attach();

    function playVideo() {
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.then(function () {
          if (button) {
            button.classList.add('hidden');
          }
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放器。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
