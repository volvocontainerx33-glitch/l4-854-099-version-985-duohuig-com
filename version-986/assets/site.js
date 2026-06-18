(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const siteNav = document.querySelector('[data-site-nav]');

    if (menuButton && siteNav) {
        menuButton.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    const backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        const searchInput = root.querySelector('[data-card-search]');
        const typeSelect = root.querySelector('[data-card-type]');
        const yearSelect = root.querySelector('[data-card-year]');
        const clearButton = root.querySelector('[data-clear-filter]');
        const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
        const count = root.querySelector('[data-filter-count]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(searchInput ? searchInput.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const matchedKeyword = !keyword || haystack.includes(keyword);
                const matchedType = !type || normalize(card.dataset.type) === type;
                const matchedYear = !year || normalize(card.dataset.year) === year;
                const matched = matchedKeyword && matchedType && matchedYear;

                card.classList.toggle('is-filter-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        const video = player.querySelector('video');
        const playButton = player.querySelector('[data-play-button]');
        const status = player.querySelector('[data-player-status]');
        const videoUrl = player.dataset.videoUrl;
        let hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function startPlayback() {
            if (!video || !videoUrl) {
                setStatus('播放源暂不可用');
                return;
            }

            if (playButton) {
                playButton.classList.add('is-hidden');
            }

            setStatus('正在载入播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(function () {
                        setStatus('正在播放');
                    }).catch(function () {
                        setStatus('浏览器已阻止自动播放，请再次点击视频播放');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function () {
                    setStatus('播放源载入异常，可刷新页面后重试');
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play().then(function () {
                        setStatus('正在播放');
                    }).catch(function () {
                        setStatus('浏览器已阻止自动播放，请再次点击视频播放');
                    });
                }, { once: true });
                return;
            }

            video.src = videoUrl;
            video.play().then(function () {
                setStatus('正在播放');
            }).catch(function () {
                setStatus('当前浏览器可能需要 HLS 支持组件才能播放 m3u8');
            });
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }
    });

    const searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        const form = searchPage.querySelector('[data-search-form]');
        const input = searchPage.querySelector('[data-search-input]');
        const results = searchPage.querySelector('[data-search-results]');
        const tip = searchPage.querySelector('[data-search-tip]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        let movies = [];

        if (input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function movieTemplate(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-wrap" href="' + movie.url + '">',
                '        <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
                '        <span class="type-badge">' + movie.type + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <a class="movie-title" href="' + movie.url + '">' + movie.title + '</a>',
                '        <p class="movie-meta">' + movie.region + ' · ' + movie.year + ' · ' + movie.genre + '</p>',
                '        <p class="movie-one-line">' + movie.oneLine + '</p>',
                '        <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function render(query) {
            const keyword = normalize(query);
            const matched = movies.filter(function (movie) {
                if (!keyword) {
                    return true;
                }

                return normalize([
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.type,
                    movie.genre,
                    movie.tags.join(' '),
                    movie.oneLine
                ].join(' ')).includes(keyword);
            });
            const limited = keyword ? matched.slice(0, 240) : matched.slice(0, 120);

            if (tip) {
                tip.textContent = keyword
                    ? '找到 ' + matched.length + ' 条结果，当前显示 ' + limited.length + ' 条。'
                    : '当前显示片库前 120 条，输入关键词可搜索全部影片。';
            }

            if (results) {
                results.innerHTML = limited.map(movieTemplate).join('');
            }
        }

        fetch('assets/movies-search.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                movies = data;
                render(initialQuery);
            })
            .catch(function () {
                if (tip) {
                    tip.textContent = '搜索索引暂时无法载入';
                }
            });

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const query = input ? input.value : '';
                const nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState({}, '', nextUrl);
                render(query);
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }
})();
