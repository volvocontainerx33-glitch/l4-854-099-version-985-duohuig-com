document.addEventListener('DOMContentLoaded', function () {
  var input = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-select]');
  var regionSelect = document.querySelector('[data-region-select]');
  var resultBox = document.querySelector('[data-search-results]');
  var countBox = document.querySelector('[data-search-count]');
  var movies = window.MOVIE_SEARCH_DATA || [];

  function card(movie) {
    return [
      '<a class="card" href="' + movie.url + '">',
      '  <div class="poster">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="score">' + movie.score + '</span>',
      '    <span class="type-tag">' + escapeHtml(movie.type) + '</span>',
      '  </div>',
      '  <div class="card-body">',
      '    <h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
      '    <div class="card-meta">' + escapeHtml(movie.region) + '<span>·</span>' + escapeHtml(movie.year) + '</div>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || movie.genre) + '</p>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function includesKeyword(movie, keyword) {
    if (!keyword) {
      return true;
    }

    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.tags || []).join(','),
      movie.oneLine
    ].join(' ').toLowerCase();

    return haystack.indexOf(keyword) !== -1;
  }

  function render() {
    var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
    var typeValue = typeSelect ? typeSelect.value : '';
    var regionValue = regionSelect ? regionSelect.value : '';

    var filtered = movies.filter(function (movie) {
      var okKeyword = includesKeyword(movie, keyword);
      var okType = !typeValue || movie.type === typeValue;
      var okRegion = !regionValue || movie.region === regionValue;
      return okKeyword && okType && okRegion;
    }).slice(0, 120);

    resultBox.innerHTML = filtered.map(card).join('');
    countBox.textContent = '已匹配 ' + filtered.length + ' 部影片';
  }

  [input, typeSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });

  render();
});
