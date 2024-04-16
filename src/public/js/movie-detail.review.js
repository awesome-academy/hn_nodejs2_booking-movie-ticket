let querySearch = null;;

let movieId = null;
let _page = null;
let _star = null;
let _starGreat = null;
let _dateEarly = null;

function initQueryParam() {
  querySearch = new URLSearchParams(window.location.search);
  movieId = +document.querySelector('#movie-id').innerText;
  _page = querySearch.get('page') ? +querySearch.get('page') : 1;
  _star = querySearch.get('star') ? +querySearch.get('star') : 0;
  _starGreat =
    querySearch.get('starGreat') == '1' || querySearch.get('starGreat') == '0'
      ? querySearch.get('starGreat')
      : '1';
  _dateEarly =
    querySearch.get('dateEarly') == '1' || querySearch.get('dateEarly') == '0'
      ? querySearch.get('dateEarly')
      : '0';
}

const commentMovieElement = document.querySelector('.comment-movie');
const lazyloading = new Lazyloading(commentMovieElement);

const protocol = window.location.protocol;
const host = window.location.host;

const movieComments = document.querySelector('.movie-comments');

const starGreatCheckBox = document.querySelector('#starGreat');
const dateEarlyCheckBox = document.querySelector('#dateEarly');

const dropdownMenu = document.querySelector('.dropdown-menu');
dropdownMenu.addEventListener('click', debounce(dropdownMenuClickHandler, 1000));

function dropdownMenuClickHandler(event) {
  if (event.target.tagName.toLowerCase() != 'input') return;

  if (event.target.id == 'dateEarly') {
    _dateEarly = event.target.checked ? '1' : '0';
  } else if (event.target.id == 'starGreat') {
    _starGreat = event.target.checked ? '1' : '0';
  } else {
    _star = +event.target.value;
  }
  renderReviewAndComment(true);
  queryParamHandler();
}

function bindingDropdownInput() {
  if (_starGreat == '1') {
    starGreatCheckBox.checked = true;
  } else {
    starGreatCheckBox.checked = false
  }

  if (_dateEarly == '1') {
    dateEarlyCheckBox.checked = true;
  } else {
    dateEarlyCheckBox.checked = false
  }

  for (let i = 0; i <= 5; i++) {
    const radioStar = document.querySelector(`#star${i}`);
    if (_star == i) {
      radioStar.checked = true;
    } else {
      radioStar.checked = false;
    }
  }
}

function queryParamHandler() {
  const queryParam = `?star=${_star}&page=${_page}&starGreat=${_starGreat}&dateEarly=${_dateEarly}`;
  window.history.pushState(null, null, queryParam);
}

function renderNoData() {
  const locale = getCookie('locale');
  movieComments.innerHTML = `
    <div class="d-flex mb-5 flex-column" style="width: 100%;">
      <img src="/img/no_star.png" class="mr-auto ml-auto mb-0 mt-5"/>
      <span class="mr-auto ml-auto mb-5 mt-0">${locale == 'vi' ? 'Không có đánh giá' : 'No Review'}</span>
    </div>
  `;
}

function renderUIWithDataFromAPI(data) {
  const items = data.items;
  const html = items.map((item, index) => {
    let html = '';
    for (let i = 1; i <= item.star; i++) {
      html += '<i class="fa-solid fa-star star-active"></i>';
    }
    for (let i = 1; i <= 5 - item.star; i++) {
      html += '<i class="fa-solid fa-star star-inactive"></i>';
    }
    html = `<div class="star-statistical-detail-mb-2">${html}</div>`;
    html = `
      <div class="comment-row d-flex${index > 0 ? ' pt-3' : ''}">
        <img src="${item.avatar}"
        class="mr-3 img-fit" width="64px" height="64px" alt="...">
        <div class="media-body">
          <h5 class="mt-0">${item.username}</h5>
          ${html}
          <p class="comment-date">${item.updatedAt}</p>
          <p>${item.comment}</p>
        </div>
      </div>
    `;
    return html;
  }).join('');

  movieComments.innerHTML = html;
}

function renderReviewAndComment(isClickNodePagination = false) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  if (isClickNodePagination) lazyloading.start();

  fetch(`${protocol}//${host}/api/review?movieId=${movieId}&star=${_star}&page=${_page}&starGreat=${_starGreat}&dateEarly=${_dateEarly}`, requestOptions)
    .then((response) => response.json())
    .then(async (result) => {
      const { message, status, data } = result;
      if (status != 200) {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
        });
        return;
      }
      if (!data) {
        await sleep(700);
        movieComments.innerHTML = '';
        pagination.innerHTML = '';
        if (isClickNodePagination) lazyloading.close();
        renderNoData();
        return;
      }
      if (isClickNodePagination) {
        await sleep(700);
        renderUIWithDataFromAPI(data);
        renderPagination(data, renderReviewAndComment, queryParamHandler);
        lazyloading.close();
      } else {
        renderUIWithDataFromAPI(data);
        renderPagination(data, renderReviewAndComment, queryParamHandler);
      }
    })
    .catch((error) => console.error(error));
}

window.addEventListener('popstate', () => {
  initQueryParam();
  bindingDropdownInput();
  renderReviewAndComment();
});

initQueryParam();
bindingDropdownInput();
renderReviewAndComment();
queryParamHandler();
