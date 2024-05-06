const btnConfirmSchedule = document.querySelector('.btn-confirm-schedule');
const mainContent = document.querySelector('.main-content');

const host = window.location.host;
const protocol = window.location.protocol;
const movieId = window.location.pathname.substring((window.location.pathname.lastIndexOf('/') + 1));

let scheduleId = 0;

const locale = getCookie('locale');

const tbody = document.querySelector('tbody');
const movieNameModal = document.querySelector('.modal-body h3');

document.querySelector('.btn-ok').addEventListener('click', () => {
  window.location.href = `/booking/choose-seat/${scheduleId}`;
});

const translate = {
  vi: {
    backToHome: 'Quay về trang chủ',
    category: 'Thể loại',
    ageLimit: 'Yêu cầu độ tuổi',
    emptySeat: 'ghế trống',
    noAgeLimit: 'Không giới hạn độ tuổi',
    duration: 'Thời lượng',
    age: 'tuổi',
    minute: 'phút',
    chooseSchedule: 'Chọn lịch chiếu',
    choosingSchedule: 'Bạn đang đặt vé xem phim',
  },
  en: {
    backToHome: 'Back To Home',
    category: 'Category',
    ageLimit: 'Age limit',
    emptySeat: 'empty seat',
    noAgeLimit: 'No age limit',
    duration: 'Duration',
    age: 'age',
    minute: 'minute',
    chooseSchedule: 'Choose schedule',
    choosingSchedule: 'You are choosing movie ticket',
  },
}

document.querySelector('#modalLabel span').innerText = translate[locale].choosingSchedule;

function renderUI() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/schedule?movieId=${movieId}`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { status, message, data } = result;
      if (status != 200) {
        renderNoDataUI();
        return;
      }
      let html = '';
      for (let i = 0; i < data.schedules.length; i++) {
        const item = data.schedules[i];
        html += `<option value="${item.id}">${item.schedule} &nbsp;&nbsp;&nbsp; ${item.emptySeat} ${translate[locale].emptySeat}</option>`
      }
      html = `
        <div class="d-flex">
          <div class="mr-5" style="width: 240px;">
            <img src="${data.smallImgurl}" width="240px" height="356px" alt="">
            <a class="btn btn-info mt-2" href="/" style="width: 240px;">${translate[locale].backToHome}</a>
          </div>
          <div>
            <h2 class="text-center">${data.name}</h2>
            <div class="mb-3">${data.shortDescription}</div>
            <div class="font-weight-bold"><span class="text-danger">${translate[locale].category}:</span> ${data.categories}</div>
            <div class="font-weight-bold"><span class="text-danger">${translate[locale].duration}:</span> ${data.duration} ${translate[locale].minute}</div>
            <div class="font-weight-bold"><span class="text-danger">${translate[locale].ageLimit}:</span> ${data.ageLimit ? '>= '+data.ageLimit+' '+translate[locale].age : translate[locale].noAgeLimit}</div>
            <select class="form-control mt-3 text-center choose-schedule" style="width: 45%;">
              <option value="0">-- ${translate[locale].chooseSchedule} --</option>
              ${html}
            </select>
          </div>
        </div>
      `;
      mainContent.insertAdjacentHTML('beforeend', html);
      movieNameModal.innerText = data.name;
      const chooseSchedule = document.querySelector('.choose-schedule');
      chooseSchedule.addEventListener('click', () => {
        scheduleId = chooseSchedule.value;
        const tokens = chooseSchedule.options[chooseSchedule.selectedIndex].innerText.split(/\s+/);
        tbody.innerHTML = `
          <tr>
            <td class="text-danger">${tokens[1]}</td>
            <td class="text-danger">${tokens[2]}</td>
            <td class="text-danger">${tokens[3]}</td>
          </tr>
        `;
        if (chooseSchedule.value != 0) {
          btnConfirmSchedule.click();
        }
      });
    })
    .catch((error) => console.error(error));
}

renderUI();
