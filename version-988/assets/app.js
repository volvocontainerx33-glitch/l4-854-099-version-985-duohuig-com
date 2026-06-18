document.addEventListener("DOMContentLoaded", function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 420) {
                backTop.classList.add("show");
            } else {
                backTop.classList.remove("show");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
    var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyMovieFilter() {
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(" "));
        var filterTerms = activeFilter === "all" ? [] : normalize(activeFilter).split(/\s+/).filter(Boolean);

        movieCards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-keywords"));
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var filterMatch = !filterTerms.length || filterTerms.some(function (term) {
                return haystack.indexOf(term) !== -1;
            });

            card.classList.toggle("is-hidden", !(queryMatch && filterMatch));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyMovieFilter);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "all";

            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });

            applyMovieFilter();
        });
    });

    var playerShells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

    playerShells.forEach(function (shell) {
        var video = shell.querySelector("video[data-src]");
        var button = shell.querySelector("[data-player-button]");

        function startPlayer(event) {
            if (event && event.target && event.target.closest("video") && video.dataset.loaded === "1") {
                return;
            }

            if (!video) {
                return;
            }

            var source = video.getAttribute("data-src");

            if (!source) {
                return;
            }

            if (video.dataset.loaded !== "1") {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (name, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });

                    video._hlsInstance = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }

                video.dataset.loaded = "1";
            }

            shell.classList.add("is-playing");
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener("click", startPlayer);
        }

        shell.addEventListener("click", startPlayer);
    });
});
