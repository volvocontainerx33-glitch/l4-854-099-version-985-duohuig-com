
document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.nav-menu');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-slide')) || 0;
            showSlide(index);
            window.clearInterval(timer);
            timer = null;
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));

    function applyFilter(root) {
        var queryInput = root.querySelector('.site-search');
        var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
        var activeButton = root.querySelector('.filter-button.active');
        var filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' ').toLowerCase();
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchFilter = filter === 'all' || haystack.indexOf(filter.toLowerCase()) !== -1;
            card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            applyFilter(document);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('.filter-button')).forEach(function (button) {
        button.addEventListener('click', function () {
            Array.prototype.slice.call(button.parentElement.querySelectorAll('.filter-button')).forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            applyFilter(document);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var source = shell.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            if (!video || !source) {
                return;
            }

            if (!started) {
                started = true;
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (!started) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
