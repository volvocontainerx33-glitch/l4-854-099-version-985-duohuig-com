(function () {
  const mobileButton = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      const opened = mobileNav.classList.toggle("open");
      mobileButton.setAttribute("aria-expanded", opened ? "true" : "false");
      mobileButton.textContent = opened ? "×" : "☰";
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 6500);
    }
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const list = document.querySelector("[data-filter-list]");
  const empty = document.querySelector("[data-empty-state]");

  function applyFilter(value) {
    if (!list) {
      return;
    }
    const keyword = String(value || "").trim().toLowerCase();
    const cards = Array.from(list.querySelectorAll("[data-card-search]"));
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = card.getAttribute("data-card-search").toLowerCase();
      const matched = keyword === "" || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  if (filterInput && list) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (filterInput.hasAttribute("data-query-input") && initial) {
      filterInput.value = initial;
    }
    applyFilter(filterInput.value);
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }
}());
