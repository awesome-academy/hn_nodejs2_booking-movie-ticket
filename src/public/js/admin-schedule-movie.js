let movieId = null;
var movieIdInput = document.querySelector('#movieId');

let roomId = null;
var roomIdInput = document.querySelector('#roomId');

const dateSearchInput = document.querySelector('#dateSearch');
const movieNameInput = document.querySelector('#movieName');

const modalTitle = document.querySelector('.modal-title');

var schedules = null;

const movieIdOptionElements = document.querySelectorAll('.movie-name-option');
movieIdOptionElements.forEach(item => {
  item.addEventListener('click', () => {
    movieIdInput.value = item.innerText;
    movieId = item.nextElementSibling.innerText;
  });
});

const roomIdOptionElement = document.querySelectorAll('.room-name-option');
roomIdOptionElement.forEach(item => {
  item.addEventListener('click', () => {
    roomIdInput.value = item.innerText;
    roomId = item.nextElementSibling.innerText;
  });
});

let querySearch = null;

let _page = null;
let _movieName = null;
let _dateSearch = null;
const locale = getCookie('locale');
let globalSchedulesIndex = null;

const translate = {
  vi: {
    numericalOrder: "STT",
    name: "Tên phim",
    duration: "Thời lượng",
    action: "Thao tác",
    edit: "Chỉnh sửa",
    active: "Hiện",
    inactive: "Ẩn",
    timeShow: "Thời gian chiếu",
    room: "Phòng",
    scheduleCode: "Mã",
    minutes: "phút",
    updateSchedule: "Cập nhật lịch chiếu phim",
    addNewSchedule: "Thêm mới lịch chiếu phim",
    seat: "ghế",
  },
  en: {
    numericalOrder: "Numerical Order",
    name: "Name",
    duration: "Duration",
    action: "Action",
    edit: "Edit",
    active: "Active",
    inactive: "Inactive",
    timeShow: "Time show",
    room: "room",
    scheduleCode: "Schedule code",
    minutes: "minutes",
    updateSchedule: "Update schedule",
    addNewSchedule: "Add new schedule",
    seat: "seat",
  },
}

const protocol = window.location.protocol;
const host = window.location.host;

const wapperTable = document.querySelector('.wapper-table-schedules');
const lazyloading = new Lazyloading(wapperTable);

function queryParamHandler() {
  querySearch = new URLSearchParams(window.location.search);
  _page = querySearch.get('page') ? +querySearch.get('page') : 1;
  _movieName = querySearch.get('movieName') ? querySearch.get('movieName') : null;
  _dateSearch = querySearch.get('dateSearch') ? querySearch.getAll('dateSearch') : null;
}

function bindingSearchInput() {
  if (_movieName) {
    movieNameInput.value = decodeURIComponent(_movieName);
  }

  if (_dateSearch) {
    dateSearchInput.value = decodeURIComponent(_dateSearch);
  }
}

function makeQueryParams() {
  let queryParam = '';
  if (_page) {
    queryParam = `${queryParam}?page=${_page}`;
  }
  if (_movieName) {
    queryParam = `${queryParam}&movieName=${encodeURIComponent(_movieName)}`;
  }
  if (_dateSearch) {
    queryParam = `${queryParam}&dateSearch=${encodeURIComponent(_dateSearch)}`;
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
  _movieName = movieNameInput.value;
  _dateSearch = dateSearchInput.value;
}

function renderUIWithDataFromAPI(data) {
  const schedules = data.items;
  const itemInPage = data.itemInPage;
  let html = `
    <table class="table table-striped mt-3">
      <thead class="thead-dark">
        <tr>
          <th scope="col">${translate[locale].numericalOrder}</th>
          <th scope="col">${translate[locale].scheduleCode}</th>
          <th scope="col">${translate[locale].name}</th>
          <th scope="col">${translate[locale].timeShow}</th>
          <th scope="col">${translate[locale].duration} (${translate[locale].minutes})</th>
          <th scope="col">${translate[locale].room}</th>
          <th scope="col">${translate[locale].action}</th>
        </tr>
      </thead>
      <tbody>
  `;
  html += schedules.map((schedule, index) => {
    return `
      <tr>
      <td class="scheduleId d-none">${schedule.id}</td>
        <th scope="row">${(_page - 1) * itemInPage + 1 + index}</th>
        <td class="text-danger">SCH${schedule.id}</td>
        <td><a href="/movie-details/${schedule.movie.id}">${schedule.movie.name}</a></td>
        <td>${schedule.startDate} ${schedule.startTime}</td>
        <td>${schedule.movie.duration}</td>
        <td>${schedule.room.name}</td>
        <td class="table-acction">
          <button type="button" class="btn btn-info btn-edit mr-2"
            data-toggle="modal" data-target="#modalSaveSchedule" data-whatever="@getbootstrap"
          >
            <span>${translate[locale].edit}</span>&nbsp;
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn btn-danger btn-inactive ${schedule.active ? '' : 'd-none'}">
            <span>${translate[locale].inactive}</span>&nbsp;
            <i class="fa-solid fa-square-xmark"></i>
          </button>
          <button type="button" class="btn btn-success btn-active ${schedule.active ? 'd-none' : ''}">
            <span>${translate[locale].active}</span>&nbsp;
            <i class="fa-solid fa-square-check"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  html += '</tbody></table>';
  wapperTable.innerHTML = html;

  const btnInactives = document.querySelectorAll('.btn-inactive');
  btnInactives.forEach((item, index) => {
    item.addEventListener('click', () => {
      const scheduleId = item.parentElement.parentElement.querySelector('.scheduleId').innerText;
      
      changeScheduleStatus(scheduleId, 'INACTIVE');

      const btnActive = item.parentElement.parentElement.querySelector('.btn-active');
      btnActive.classList.remove('d-none');
      item.classList.add('d-none');
    });
  });

  const btnActives = document.querySelectorAll('.btn-active');
  btnActives.forEach((item, index) => {
    item.addEventListener('click', () => {
      const scheduleId = item.parentElement.parentElement.querySelector('.scheduleId').innerText;
      
      changeScheduleStatus(scheduleId, 'ACTIVE');

      const btnInactive = item.parentElement.parentElement.querySelector('.btn-inactive');
      btnInactive.classList.remove('d-none');
      item.classList.add('d-none');
    });
  });

  const btnEdits = document.querySelectorAll('.btn-edit');
  btnEdits.forEach((item, index) => {
    item.addEventListener('click', () => {
      modalTitle.innerText = translate[locale].updateSchedule;
      modalFlag = 1;
      globalSchedulesIndex = index;
      clearDataModal();
      bindingScheduleInModal(index);
    });
  });
}

function clearDataModal() {
  movieIdInput.value = '';
  roomIdInput.value = '';
  startDateInput.value = '';
  startTimeInput.value = '';
}

const btnAddNewSchedule = document.querySelector('.btn-add-new-schedule');
btnAddNewSchedule.addEventListener('click', () => {
  modalTitle.innerText = translate[locale].addNewSchedule;
  modalFlag = 0;
  clearDataModal();
});

function renderNoData() {
  const locale = getCookie('locale');
  const html = `
    <div class="d-flex mb-5 flex-column mt-5" style="width: 100%">
      <img src="/img/no-result.png" class="mr-auto ml-auto mb-0 mt-5"/>
      <span class="mr-auto ml-auto mb-5 mt-0">${locale == 'vi' ? 'Không kết quả' : 'No Result'}</span>
    </div>
  `;
  wapperTable.innerHTML = html;
}

function renderSchedulesWithPagination(isClickNodePagination = false) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  getValueInput(isClickNodePagination);
  const qs = saveStateWithQueryParam();

  lazyloading.start();
  fetch(`${protocol}//${host}/api/schedule/all${qs}`, requestOptions)
    .then((response) => response.json())
    .then(async (result) => {
      const { message, status, data, errors } = result;

      await sleep(700);
      lazyloading.close();
      if (status != 200) {
        wapperTable.innerHTML = '';
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
        wapperTable.innerHTML = '';
        pagination.innerHTML = '';
        renderNoData();
        return;
      }
      schedules = data.items;
      renderUIWithDataFromAPI(data);
      renderPagination(data, renderSchedulesWithPagination, saveStateWithQueryParam);
    })
    .catch((error) => console.error(error));
}

const btnSearchSchedule = document.querySelector('.btn-search-schedule');
btnSearchSchedule.addEventListener('click', () => {
  renderSchedulesWithPagination();
});

window.addEventListener('popstate', () => {
  queryParamHandler();
  bindingSearchInput();
  renderSchedulesWithPagination();
});

queryParamHandler();
saveStateWithQueryParam();
bindingSearchInput();
renderSchedulesWithPagination();
