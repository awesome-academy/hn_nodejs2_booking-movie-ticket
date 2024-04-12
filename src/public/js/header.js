document.querySelector('.multi-language').oninput = function() {
  const params = new URLSearchParams(window.location.search);
  params.set('locale', this.value);
  window.location.href = `${window.location.pathname}?${params.toString()}`;
}
