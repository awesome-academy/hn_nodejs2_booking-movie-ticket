let querySearch = null;

let _page = null;
let _name = null;
let _categoryIds = null;
let _age = null;

const nameInput = document.querySelector('#movie-name');
const categoryIdsInput = Array.from(document.querySelectorAll('.category-item'));
const ageInput = document.querySelector('#movie-age');

const protocol = window.location.protocol;
const host = window.location.host;

const allMoviesElement = document.querySelector('.all-movies');
const lazyloading = new Lazyloading(allMoviesElement);

function queryParamHandler() {
  querySearch = new URLSearchParams(window.location.search);
  _page = querySearch.get('page') ? +querySearch.get('page') : 1;
  _name = querySearch.get('name') ? querySearch.get('name') : null;
  _categoryIds = querySearch.getAll('categoryIds') ? querySearch.getAll('categoryIds') : null;
  _age = querySearch.get('age') ? +querySearch.get('age') : null;
}

function bindingDropdownInput() {
  if (_name) {
    nameInput.value = decodeURIComponent(_name);
  }

  categoryIdsInput?.forEach(categoryIdInput => {
    categoryIdInput.checked = false;
  });

  _categoryIds?.forEach(item => {
    categoryIdsInput?.forEach(categoryIdInput => {
      if (categoryIdInput.value == item) {
        categoryIdInput.checked = true;
      }
    });
  });

  if (_age) {
    ageInput.value = decodeURIComponent(_age);
  }
}

function makeQueryParams() {
  let queryParam = '';
  if (_page) {
    queryParam = `${queryParam}?page=${_page}`;
  }
  if (_name) {
    queryParam = `${queryParam}&name=${_name}`;
  }
  _categoryIds?.forEach(item => {
    queryParam = `${queryParam}&categoryIds=${item}`;
  });
  if (_age) {
    queryParam = `${queryParam}&age=${_age}`;
  }
  querySearch = new URLSearchParams(queryParam);
  return queryParam;
}

function saveStateWithQueryParam() {
  const queryParam = makeQueryParams();
  window.history.pushState(null, null, queryParam);
  return queryParam;
}

function getValueInput(isClickNodePagination) {
  if (!isClickNodePagination) _page = 1;
  _name = nameInput.value;
  _age = ageInput.value;
  _categoryIds = [];
  for (let item of categoryIdsInput) {
    if (item.checked == true) {
      _categoryIds.push(item.value);
    }
  }
}

function renderNoData() {
  const locale = getCookie('locale');
  const html = `
    <div class="d-flex mb-5 flex-column mt-5" style="width: 100%">
      <img src="/img/no-result.png" class="mr-auto ml-auto mb-0 mt-5"/>
      <span class="mr-auto ml-auto mb-5 mt-0">${locale == 'vi' ? 'Không kết quả' : 'No Result'}</span>
    </div>
  `;
  allMoviesElement.innerHTML = html;
}

function renderUIWithDataFromAPI(data) {
  const movies = data.items;
  const itemInPage = data.itemInPage;
  const locale = getCookie('locale');
  let html = movies.map(movie => {
    return `
      <div class="card movie-item">
        <img class="card-img-top img-movie" src="${movie.smallImgurl}" alt="Card image">
        <div class="card-body">
          <h4 class="card-title">${movie.name}</h4>
          <p class="card-text movie-short-description">${movie.shortDescription}</p>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <a href="/movie-details/${movie.id}" class="btn btn-outline-warning btn-view-movie-detail">${locale == 'vi' ? 'Chi tiết' : 'Detail'}</a>
          <a href="/booking/${movie.id}" class="btn btn-outline-danger">${locale == 'vi' ? 'Mua vé' : 'By ticket'}</a>
        </div>
      </div>
    `;
  }).join('');
  for (let i = 0; i < itemInPage - movies.length; i++) {
    html += '<div class="card movie-item invisible"></div>';
  }
  allMoviesElement.innerHTML = html;
}

function renderMoviesWithPagination(isClickNodePagination = false) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  getValueInput(isClickNodePagination);
  const qs = saveStateWithQueryParam();

  lazyloading.start();
  fetch(`${protocol}//${host}/api/movie${qs}`, requestOptions)
    .then((response) => response.json())
    .then(async (result) => {
      const { message, status, data, errors } = result;
      await sleep(700);
      lazyloading.close();
      if (status != 200) {
        allMoviesElement.innerHTML = '';
        pagination.innerHTML = '';
        Swal.fire({
          title: 'Error',
          text: Object.values(errors).reduce((prev, curr) => {
            return `${prev == '' ? prev : prev+', '}${curr}`;
          }, ''),
          icon: 'error',
        });
        return;
      }
      if (!data) {
        allMoviesElement.innerHTML = '';
        pagination.innerHTML = '';
        renderNoData();
        return;
      }
      renderUIWithDataFromAPI(data);
      renderPagination(data, renderMoviesWithPagination, saveStateWithQueryParam);
    })
    .catch((error) => console.error(error));
}

nameInput.addEventListener('input', debounce(() => { renderMoviesWithPagination() }, 1000));

categoryIdsInput.forEach(item => {
  item.addEventListener('click', debounce(() => { renderMoviesWithPagination() }, 1000));
});

ageInput.addEventListener('input', debounce(() => { renderMoviesWithPagination() }, 1000));

window.addEventListener('popstate', () => {
  queryParamHandler();
  bindingDropdownInput();
  renderMoviesWithPagination();
});

queryParamHandler();
saveStateWithQueryParam();
bindingDropdownInput();

if (querySearch.toString() != 'page=1') {
  renderMoviesWithPagination();
}
