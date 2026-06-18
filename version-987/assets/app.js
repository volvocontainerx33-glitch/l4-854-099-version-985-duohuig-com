(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(value) {
    return String(value || "").toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var region = scope.querySelector("[data-region-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var q = textOf(input && input.value).trim();
        var y = textOf(year && year.value).trim();
        var r = textOf(region && region.value).trim();
        var t = textOf(type && type.value).trim();
        var visible = 0;

        cards.forEach(function (card) {
          var hay = textOf(card.getAttribute("data-search"));
          var cy = textOf(card.getAttribute("data-year"));
          var cr = textOf(card.getAttribute("data-region"));
          var ct = textOf(card.getAttribute("data-type"));
          var ok = true;

          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (y && cy !== y) {
            ok = false;
          }
          if (r && cr !== r) {
            ok = false;
          }
          if (t && ct !== t) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupHeroSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "library.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupHeroSearch();
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player]");
    var mask = document.querySelector("[data-play-mask]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !streamUrl) {
      return;
    }

    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function play() {
      attach();
      if (mask) {
        mask.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (mask) {
      mask.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
