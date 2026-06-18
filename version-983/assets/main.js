document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var backtop = document.querySelector('[data-backtop]');
  if (backtop) {
    backtop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var filterInput = document.querySelector('[data-page-filter]');
  if (filterInput) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      document.querySelectorAll('[data-filter-card]').forEach(function (card) {
        var text = card.getAttribute('data-filter-card').toLowerCase();
        card.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }
});
