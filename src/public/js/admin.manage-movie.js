let querySearch = null;

let _page = null;
let _name = null;
let _categoryIds = null;
let _age = null;

var nameInput = document.querySelector('#movie-name');
const categoryIdsInput = Array.from(document.querySelectorAll('.category-item'));
const ageInput = document.querySelector('#movie-age');

const protocol = window.location.protocol;
const host = window.location.host;

const listMoviesElement = document.querySelector('.list-movies');
const lazyloading = new Lazyloading(listMoviesElement);

const btnOK = document.querySelector('.btn-ok');
const modalTitle = document.querySelector('.modal-title');
const btnCloseModal = document.querySelector('.close-modal');

btnCloseModal.addEventListener('click', () => {
  clearDataModal();
  turnOffInvalidInputFeedback();
});

btnOK.addEventListener('click', () => {
  saveMovie();
});

let movies = [];
var modalFlag = 0;
var globalMoviesIndex = 0;

const translate = {
  vi: {
    numericalOrder: "STT",
    detail: "Chi tiết",
    byTicket: "Mua vé",
    name: "Tên phim",
    direction: "Đạo diễn",
    actors: "Diễn viên",
    releaseDate: "Ngày Ra Mắt",
    startDateShowing: "Ngày Khởi Chiếu",
    categories: "Thể Loại",
    duration: "Thời Lượng",
    language: "Ngôn Ngữ",
    age: "tuổi",
    ageLimit: "Độ Tuổi",
    noAgeLimit: "Không giới hạn độ",
    review: "Đánh giá",
    reviews: "đánh giá",
    noReview: "Không có đánh giá",
    introduce: "Giới Thiệu",
    reviewAndComment: "Đánh giá và nhận xét",
    minutes: "phút",
    endDateShowing: "Ngày dừng chiếu",
    largeImage: "Ảnh to",
    smallImage: "Ảnh bé",
    shortDescription: "Mô tả ngắn ngọn",
    longDescription: "Mô tả chi tiết",
    action: "Thao tác",
    edit: "Chỉnh sửa",
    active: "Hiện",
    inactive: "Ẩn",
    addNewMovie: "Thêm phim mới",
    updateMovie: "Cập nhật phim",
  },
  en: {
    numericalOrder: "Numerical Order",
    detail: "Detail",
    byTicket: "By ticket",
    name: "Name",
    direction: "Direction",
    actors: "Actors",
    releaseDate: "Release Date",
    startDateShowing: "Start Date Showing",
    categories: "Categories",
    duration: "Duration",
    language: "Language",
    age: "Age",
    ageLimit: "Age Limit",
    noAgeLimit: "No Age Limit",
    review: "Review",
    reviews: "review",
    noReview: "No Review",
    introduce: "Introduce",
    reviewAndComment: "Review and comment",
    minutes: "minutes",
    endDateShowing: "End date showing",
    largeImage: "Large image",
    smallImage: "Small image",
    shortDescription: "Short Description",
    longDescription: "Long Description",
    action: "Action",
    edit: "Edit",
    active: "Active",
    inactive: "Inactive",
    addNewMovie: "Add new movie",
    updateMovie: "Update movie",
  },
}

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
  listMoviesElement.innerHTML = html;
}

async function changeMovieStatus(movideId, status, moviesIndex) {
  const locale = getCookie('locale');

  const urlencoded = new URLSearchParams();
  urlencoded.append("movieId", movideId);
  urlencoded.append("status", status);

  const requestOptions = {
    method: "PUT",
    body: urlencoded,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${protocol}//${host}/api/admin/manage-movie/change-status`, requestOptions);
    const data = await response.json();
    movies[moviesIndex] = data.data;
    Swal.fire({
      title: locale == "vi" ? "Thành công" : "Success",
      text: locale == "vi" ? "Cập nhật trạng thái của phim thành công" : "Update movie status success",
      icon: "success",
    });
  } catch (error) {
    console.log(error);
    if (!error.errors) return;

    Swal.fire({
      title: locale == "vi" ? "Lỗi" : "Error",
      text: Object.values(error.errors)[0],
      icon: "error",
    });
  }
}

function renderUIWithDataFromAPI(data) {
  const movies = data.items;
  const itemInPage = data.itemInPage;
  const locale = getCookie('locale');
  let html = `
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th scope="col">${translate[locale].numericalOrder}</th>
          <th scope="col">${translate[locale].name}</th>
          <th scope="col">${translate[locale].categories}</th>
          <th scope="col">${translate[locale].duration} (${translate[locale].minutes})</th>
          <th scope="col">${translate[locale].action}</th>
        </tr>
      </thead>
      <tbody>
  `;
  html += movies.map((movie, index) => {
    return `
      <tr>
        <td class="movieId d-none">${movie.id}</td>
        <th scope="row">${(_page - 1) * itemInPage + 1 + index}</th>
        <td><a href="/movie-details/${movie.id}">${movie.name}</a></td>
        <td>${movie.categories.map(item => item.name).join(', ')}</td>
        <td>${movie.duration}</td>
        <td class="table-acction">
          <button type="button" class="btn btn-info btn-edit mr-2"
            data-toggle="modal" data-target="#modalAddNewMovie" data-whatever="@getbootstrap"
          >
            <span>${translate[locale].edit}</span>&nbsp;
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn btn-danger btn-inactive ${movie.active ? '' : 'd-none'}">
            <span>${translate[locale].inactive}</span>&nbsp;
            <i class="fa-solid fa-square-xmark"></i>
          </button>
          <button type="button" class="btn btn-success btn-active ${movie.active ? 'd-none' : ''}">
            <span>${translate[locale].active}</span>&nbsp;
            <i class="fa-solid fa-square-check"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  html += '</tbody></table>'
  listMoviesElement.innerHTML = html;

  const btnInactives = document.querySelectorAll('.btn-inactive');
  btnInactives.forEach((item, index) => {
    item.addEventListener('click', () => {
      const movideId = item.parentElement.parentElement.querySelector('.movieId').innerText;
      
      changeMovieStatus(movideId, 'INACTIVE', (_page - 1) * itemInPage + index);

      const btnActive = item.parentElement.parentElement.querySelector('.btn-active');
      btnActive.classList.remove('d-none');
      item.classList.add('d-none');
    });
  });

  const btnActives = document.querySelectorAll('.btn-active');
  btnActives.forEach((item, index) => {
    item.addEventListener('click', () => {
      const movideId = item.parentElement.parentElement.querySelector('.movieId').innerText;
      
      changeMovieStatus(movideId, 'ACTIVE', (_page - 1) * itemInPage + index);

      const btnInactive = item.parentElement.parentElement.querySelector('.btn-inactive');
      btnInactive.classList.remove('d-none');
      item.classList.add('d-none');
    });
  });

  const btnEdits = document.querySelectorAll('.btn-edit');
  btnEdits.forEach((item, index) => {
    item.addEventListener('click', () => {
      modalTitle.innerText = translate[locale].updateMovie;
      modalFlag = 1;
      globalMoviesIndex = index;
      bindingMovieInModal(index);
    });
  });
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

      movies = data.items;

      await sleep(700);
      lazyloading.close();
      if (status != 200) {
        listMoviesElement.innerHTML = '';
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
        listMoviesElement.innerHTML = '';
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
renderMoviesWithPagination();
