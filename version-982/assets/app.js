(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('open', !expanded);
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var miniCards = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      miniCards.forEach(function (card, i) {
        card.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    miniCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        show(Number(card.getAttribute('data-hero-mini')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var scope = form.closest('main') || document;
      var grid = scope.querySelector('[data-filter-grid]');
      var empty = scope.querySelector('[data-empty-state]');
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function apply() {
        var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
        var region = normalize(form.elements.region && form.elements.region.value);
        var type = normalize(form.elements.type && form.elements.type.value);
        var year = normalize(form.elements.year && form.elements.year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            matched = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            matched = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      form.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });

      Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      });
    });
  }

  var hlsLoader;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoader) {
      hlsLoader = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsLoader;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var src = player.getAttribute('data-video-url');
      var hlsInstance;
      var started = false;

      if (!video || !src) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('点击视频区域继续播放');
          });
        }
      }

      function attachWithHls(Hls) {
        if (!Hls || !Hls.isSupported()) {
          setStatus('当前浏览器暂不支持此格式');
          return;
        }

        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          playVideo();
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放加载失败，请刷新后重试');
            hlsInstance.destroy();
          }
        });
      }

      function start() {
        if (started) {
          playVideo();
          return;
        }

        started = true;
        if (overlay) {
          overlay.classList.add('hidden');
        }
        setStatus('正在加载...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            setStatus('');
            playVideo();
          }, { once: true });
          video.load();
          return;
        }

        loadHls().then(attachWithHls).catch(function () {
          setStatus('当前浏览器暂不支持此格式');
        });
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
    initPlayers();
  });
})();
