function Lazyloading(parentElement) {
  html = `
  <div class="lazyloading position-absolute d-flex" style="top: 0; right: 0; left: 0; bottom: 0; background-color: rgba(255, 255, 255, 0.5); z-index: 1;">
    <div class="spinner-border text-primary" role="status" style="margin: auto;">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
  `;

  this.start = function() {
    parentElement.insertAdjacentHTML('afterbegin', html);
  }

  this.close = function() {
    parentElement.removeChild(parentElement.firstElementChild);
  }
}
