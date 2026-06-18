(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5500);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        restart();
    }

    function initFilters() {
        var inputs = qsa('[data-filter-input]');
        var selects = qsa('[data-filter-select]');
        var controls = inputs.concat(selects);

        function scopeFor(control) {
            var selector = control.getAttribute('data-filter-scope');
            return selector ? qs(selector) : null;
        }

        function resultCounter(scope) {
            if (!scope) {
                return null;
            }
            var container = scope.closest('section') || document;
            return qs('[data-result-count]', container);
        }

        function apply(scope) {
            if (!scope) {
                return;
            }
            var section = scope.closest('section') || document;
            var textInput = qs('[data-filter-input][data-filter-scope="#' + scope.id + '"]', section) || qs('[data-filter-input]', section);
            var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
            var selectValues = {};
            qsa('[data-filter-select][data-filter-scope="#' + scope.id + '"]', section).forEach(function (select) {
                var key = select.getAttribute('data-filter-select');
                if (key && select.value) {
                    selectValues[key] = select.value.toLowerCase();
                }
            });

            var visible = 0;
            qsa('[data-card="movie"]', scope).forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var ok = !keyword || text.indexOf(keyword) !== -1;
                Object.keys(selectValues).forEach(function (key) {
                    var value = (card.getAttribute('data-' + key) || '').toLowerCase();
                    if (selectValues[key] && value !== selectValues[key]) {
                        ok = false;
                    }
                });
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            var counter = resultCounter(scope);
            if (counter) {
                counter.textContent = '显示 ' + visible + ' 部';
            }
        }

        inputs.forEach(function (input) {
            if (input.hasAttribute('data-query-param')) {
                var paramName = input.getAttribute('data-query-param');
                var params = new URLSearchParams(window.location.search);
                var value = params.get(paramName);
                if (value) {
                    input.value = value;
                }
            }
        });

        controls.forEach(function (control) {
            var scope = scopeFor(control);
            if (!scope) {
                return;
            }
            control.addEventListener('input', function () {
                apply(scope);
            });
            control.addEventListener('change', function () {
                apply(scope);
            });
            apply(scope);
        });
    }

    function initPlayers() {
        qsa('.js-player').forEach(function (player) {
            var button = qs('[data-player-play]', player);
            var video = qs('video', player);
            var message = qs('[data-player-message]', player);
            var source = player.getAttribute('data-src');
            var hlsInstance = null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function play() {
                if (!video || !source) {
                    setMessage('未找到可播放源。');
                    return;
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                setMessage('正在加载播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('播放源已加载。');
                        video.play().catch(function () {
                            setMessage('播放源已就绪，请再次点击播放器播放。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请检查网络或替换 m3u8 地址。');
                        }
                    });
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('播放源已加载。');
                        video.play().catch(function () {
                            setMessage('播放源已就绪，请再次点击播放器播放。');
                        });
                    }, { once: true });
                    return;
                }

                setMessage('当前浏览器不支持该播放方式，请更换浏览器或替换播放源。');
            }

            if (button) {
                button.addEventListener('click', play);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
