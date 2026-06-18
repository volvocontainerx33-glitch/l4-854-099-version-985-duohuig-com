(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
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

  function setupFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var region = area.querySelector("[data-filter-region]");
      var type = area.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
      var empty = area.querySelector("[data-empty]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = valueOf(input);
        var r = valueOf(region);
        var t = valueOf(type);
        var shown = 0;
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && String(card.dataset.region || "").toLowerCase() !== r) {
            ok = false;
          }
          if (t && String(card.dataset.type || "").toLowerCase() !== t) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      [input, region, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-play]");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function reveal() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function restore() {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    }

    function beginPlayback() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          restore();
        });
      }
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          beginPlayback();
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      reveal();
      load();
      beginPlayback();
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
    video.addEventListener("play", reveal);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
