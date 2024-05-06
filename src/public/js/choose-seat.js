const timmerElement = document.querySelector('.count-down span');
const progressBar = document.querySelector('.progress-bar');
let TIMMER = 599;
const TOTALTIME = 599;

const protocol = window.location.protocol;
const host = window.location.host;
const scheduleId = window.location.pathname.substring((window.location.pathname.lastIndexOf('/') + 1));

const locale = getCookie('locale');
let interval = null;

const content = document.querySelector('.content');
const additionalInfo = document.querySelector('.additional-info');
const seatContainer = document.querySelector('.seat-container');
const modalBody = document.querySelector('.modal-body');

const choosedSeats = [];
const seatIds = [];
let foodIds = [];
let quantities = [];

let normalPrice = 0;
let vipPrice = 0;

let totalPriceFromTicket = 0;
let totalPriceFromFood = 0;

const translate = {
  vi: {
    screen: 'Màn hình',
    category: 'Thể loại',
    ageLimit: 'Yêu cầu độ tuổi',
    emptySeat: 'ghế trống',
    noAgeLimit: 'Không giới hạn độ tuổi',
    duration: 'Thời lượng',
    age: 'tuổi',
    minute: 'phút',
    dateShow: 'Ngày chiếu',
    timeShow: 'Giờ chiếu',
    room: 'Phòng chiếu',
    seats: 'Ghế ngồi',
    normalSeat: 'Ghế thường',
    vipSeat: 'Ghế VIP',
    choosedSeat: 'Ghế đã chọn',
    choosingSeat: 'Ghế đang chọn',
    noChoosedSeat: 'Ghế chưa chọn',
    continue: 'Tiếp tục',
    totalPriceFromTicket: 'Tổng tiền vé',
    numericalOrder: 'STT',
    foodCode: 'Mã đồ ăn',
    foodImage: 'Ảnh',
    foodPrice: 'Giá',
    foodQuantity: 'Số lượng',
    foodDescription: 'Mô tả',
    chooseFood: 'Chọn đồ ăn',
    keepingSeat: 'Ghế đang giữ',
    totalPriceFromFood: 'Tổng tiền đồ ăn',
    chooseTypePayOnline: 'Chọn hình thức thanh toán online',
  },
  en: {
    screen: 'Screen',
    category: 'Category',
    ageLimit: 'Age limit',
    emptySeat: 'empty seat',
    noAgeLimit: 'No age limit',
    duration: 'Duration',
    age: 'age',
    minute: 'minute',
    dateShow: 'Date show',
    timeShow: 'Time show',
    room: 'Room',
    seats: 'Seats',
    normalSeat: 'Normal seat',
    vipSeat: 'VIP seat',
    choosedSeat: 'Choosed seat',
    choosingSeat: 'Choosing seat',
    noChoosedSeat: 'No choosed seat',
    continue: 'Continue',
    totalPriceFromTicket: 'Total price from ticket',
    numericalOrder: 'STT',
    foodCode: 'Food Code',
    foodImage: 'Image',
    foodPrice: 'Price',
    foodQuantity: 'Quantity',
    foodDescription: 'Description',
    chooseFood: 'Choose Food',
    keepingSeat: 'Keeping Seat',
    totalPriceFromFood: 'Total price from food',
    chooseTypePayOnline: 'Choose type pay online',
  }
}

function setSeatLableState(seatLabel) {
  const checkBoxInput = seatLabel.nextElementSibling;
  const icon = seatLabel.querySelector('i');
  if (icon.classList.contains('choosed') || icon.classList.contains('keeping')) {
    return;
  }

  const choosedSeatsElements = document.querySelectorAll('.choosed-seats');
  const totalPriceFromTicketElements = document.querySelectorAll('.totalPriceFromTicket');

  if (checkBoxInput.checked == true) {
    icon.classList.remove('no-choose');
    icon.classList.add('choosing');
    choosedSeats.push(seatLabel.firstElementChild.firstElementChild.innerText);
    seatIds.push(seatLabel.nextElementSibling.value);
    totalPriceFromTicket += +seatLabel.nextElementSibling.nextElementSibling.innerText;
  } else {
    icon.classList.add('no-choose');
    icon.classList.remove('choosing');
    choosedSeats.pop(seatLabel.firstElementChild.firstElementChild.innerText);
    seatIds.pop(seatLabel.nextElementSibling.value);
    totalPriceFromTicket -= +seatLabel.nextElementSibling.nextElementSibling.innerText;
  }

  const btnContinue = document.querySelector('.btn-continue');
  if (choosedSeats.length) {
    btnContinue.disabled = false;
  } else {
    btnContinue.disabled = true;
  }
  choosedSeatsElements.forEach(item => {
    item.innerText = choosedSeats.join(', ');
  });

  totalPriceFromTicketElements.forEach(item => {
    item.innerText = new Number(totalPriceFromTicket).toLocaleString('vi');
  });
}

function fillZero(x) {
  if (x < 10) return `0${x}`;
  return `${x}`;
}

function countDown() {
  interval = setInterval(() => {
    const minute = (TIMMER / 60) | 0;
    const second = TIMMER % 60;
    timmerElement.innerText = `${fillZero(minute)}:${fillZero(second)}`;
    progressBar.style.width = `${TIMMER / TOTALTIME * 100}%`;

    TIMMER--;
    if (TIMMER < 0) {
      window.location.href = '/';
    }
  }, 1000);
}

function renderScheduleInfo(data, classImg, scheduleInfoClass,sizeImg, parentElement) {
  const [day, date, time] = data.schedule.split(' ');
  const html = `
    <div class="schedule-info d-flex ${scheduleInfoClass}">
      <img class="${classImg}" src="${data.movie.smallImgurl}" alt="" width="${sizeImg.width}px" height="${sizeImg.height}px">
      ${parentElement != content ? '<div style="width: 100%;">' : ''}
      <h3 class="text-center mt-3">${data.movie.name}</h3>
      <div class="font-weight-bold">
        <i class="fa-solid fa-tag"></i>
        <span class="text-danger">${translate[locale].category}:</span>
        ${data.movie.categories}
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-clock"></i>
        <span class="text-danger">${translate[locale].duration}:</span>
        ${data.movie.duration} ${translate[locale].minute}
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-user"></i>
        <span class="text-danger">${translate[locale].ageLimit}:</span>
        ${data.movie.ageLimit ? data.movie.ageLimit+' '+translate[locale].age : translate[locale].noAgeLimit}
      </div>
      <hr>
      <div class="font-weight-bold">
        <i class="fa-solid fa-calendar-days"></i>
        <span class="text-danger">${translate[locale].dateShow}:</span>
        ${day} ${date}
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-clock"></i>
        <span class="text-danger">${translate[locale].timeShow}:</span>
        ${time}
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-table-columns"></i>
        <span class="text-danger">${translate[locale].room}:</span>
        ${data.room.name}
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-couch"></i>
        <span class="text-danger">${translate[locale].seats}:</span>
        <span class="choosed-seats"></span>
      </div>
      <div class="font-weight-bold">
        <i class="fa-solid fa-dollar-sign"></i>
        <span class="text-danger">${translate[locale].totalPriceFromTicket}:</span>
        <span class="totalPriceFromTicket">0</span>
        <span class="text-danger">VNĐ</span>
      </div>
      ${
        parentElement != content
        ? `
          <div class="font-weight-bold">
            <i class="fa-solid fa-dollar-sign"></i>
            <span class="text-danger">${translate[locale].totalPriceFromFood}:</span>
            <span class="totalPriceFromFood">0</span>
            <span class="text-danger">VNĐ</span>
          </div>
          <div class="d-flex">
            <div class="my-auto mr-3">
              <i class="fa-solid fa-money-bill font-weight-bold"></i>
              <span class="text-danger font-weight-bold">${translate[locale].chooseTypePayOnline}:</span>
            </div>
            <select class="form-control choose-type-pay-online text-center my-auto">
              <option value="VNPAY">VNPAY</option>
              <option value="MOMO">MOMO</option>
            </select>
          </div>
        `
        : `
          <div class="d-flex mt-3">
            <button type="button" class="btn btn-success btn-continue mx-auto"
              disabled
              data-toggle="modal" data-target="#modalChooseFood" data-whatever="@getbootstrap"
            >
              ${translate[locale].continue}
            </button>
          </div>
        `
      }
      ${parentElement != content ? '</div>' : ''}
    </div>
  `;
  parentElement.insertAdjacentHTML('beforeend', html);
}

function renderSeatSchema(data) {
  const rows = {};
  const seats = data.seats;
  seats.forEach(seat => {
    const rowName = seat.name[0];
    if (!Array.isArray(rows[rowName])) {
      rows[rowName] = [];
    }
    rows[rowName].push(seat);
  });
  Object.values(rows).forEach(row => {
    row.sort((seat1, seat2) => {
      const no1 = +seat1.name.substring(1);
      const no2 = +seat2.name.substring(1);
      return no1 - no2;
    });
  });
  let html = `
    <div class="seat-schema">
      <div class="screen-wapper mb-4 d-flex"><div class="screen m-auto">${translate[locale].screen}</div></div>
  `;
  Object.values(rows).forEach(row => {
    html += '<div class="d-flex justify-content-around row-seat">';
    row.forEach(seat => {
      if (seat.type == 'NORMAL') {
        normalPrice = seat.price;
      } else {
        vipPrice = seat.price;
      }

      html += `
        <div class="seat-group">
          <label for="${seat.name}" class="seat-icon">
            <div class="d-flex"><span class="m-auto font-weight-bold">${seat.name}</span></div>
            <i class="fa-solid
              ${seat.type == 'NORMAL' ? ' fa-couch' : ' fa-crown'}
              ${seat.status == 'BOOKED'
                ? 'choosed' : (seat.status == 'KEEPING' ? 'keeping' : 'no-choose')
              }"
            >
            </i>
          </label>
          <input type="checkbox"
            id="${seat.name}"
            value="${seat.id}" class="d-none"
            ${seat.status == 'BOOKED' || seat.status == 'KEEPING' ? 'checked disabled readonly' : 'checked="false"'}
          >
          <span class="d-none">${seat.price}</span>
        </div>
      `;
    });
    html += '</div>';
  });
  seatContainer.insertAdjacentHTML('afterbegin', html);
  document.querySelectorAll('.seat-icon').forEach(item => {
    item.addEventListener('click', () => {
      setSeatLableState(item);
    });
  });
}

function renderAdditionalInfo() {
  const html = `
    <div class="font-weight-bold seat-info">
      <div>
        <i class="fa-solid fa-couch"></i>
        ${translate[locale].normalSeat}: ${Number(normalPrice).toLocaleString('vi')} <span class="text-danger">VNĐ</span>
      </div>
      <div>
        <i class="fa-solid fa-crown"></i>
        ${translate[locale].vipSeat}: ${Number(vipPrice).toLocaleString('vi')} <span class="text-danger">VNĐ</span>
      </div>
      <div>
        <i class="fa-solid fa-couch no-choose"></i>
        ${translate[locale].noChoosedSeat}
      </div>
      <div>
        <i class="fa-solid fa-couch choosed"></i>
        ${translate[locale].choosedSeat}
      </div>
      <div>
        <i class="fa-solid fa-couch choosing"></i>
        ${translate[locale].choosingSeat}
      </div>
      <div>
      <i class="fa-solid fa-couch keeping"></i>
      ${translate[locale].keepingSeat}
    </div>
    </div>
  `;
  additionalInfo.insertAdjacentHTML('afterbegin', html);
}

function bindingTicketInfoToModal(data) {
  renderScheduleInfo(data, 'mr-5', 'pl-0', { width: 240, height: 356 }, modalBody);
}

function renderChooseSeatUI() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/schedule/${scheduleId}`, requestOptions)
    .then((response) => {
      TIMMER = +response.headers.get('remainTime');
      return response.json();
    })
    .then((result) => {
      const { status, message, data } = result;
      if (status != 200) {
        clearInterval(interval);
        renderNoDataUI();
        return;
      }
      renderScheduleInfo(data, 'mx-auto', 'flex-column', { width: 150, height: 200 }, content);
      renderSeatSchema(data);
      renderAdditionalInfo();
      countDown(TIMMER);
      bindingTicketInfoToModal(data);
      renderChooseFoodsUI();
    })
    .catch((error) => console.error(error));
}

function renderTableListFoods(data) {
  let html = `
    <h3 class="text-center mt-5 mb-3">${translate[locale].chooseFood}</h3>
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th scope="col">${translate[locale].numericalOrder}</th>
          <th scope="col">${translate[locale].foodCode}</th>
          <th scope="col">${translate[locale].foodImage}</th>
          <th scope="col">${translate[locale].foodPrice}</th>
          <th scope="col">${translate[locale].foodQuantity}</th>
          <th scope="col">${translate[locale].foodDescription}</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (let i = 0; i < data.length; i++) {
    const food = data[i];
    html += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td class="text-danger">FOOD<span class="food-id">${food.id}</span></td>
        <td><image src="${food.imgurl}" width="64px" height="64px" style="border-radius: 50%;" /></td>
        <td>${Number(food.price).toLocaleString('vi')} <span class="text-danger">VNĐ</span></td>
        <td>
          <input class="form-control food-quantity-input" type="number" value="0" min="0" max="3" id="food-${food.id}" />
          <span class="d-none">${food.price}</span>
        </td>
        <td>${food.description}</td>
      </tr>
    `;
  }
  html += '</tbody></table>';
  modalBody.insertAdjacentHTML('beforeend', html);
  const foodQuantityInputElements = document.querySelectorAll('.food-quantity-input');
  const totalPriceFromFoodElement = document.querySelector('.totalPriceFromFood');
  foodQuantityInputElements.forEach(item => {
    item.addEventListener('input', () => {
      totalPriceFromFood = 0;
      foodIds = [];
      quantities = [];
      for (let foodQuantityElement of foodQuantityInputElements) {
        const money = +foodQuantityElement.value * +foodQuantityElement.nextElementSibling.innerText;
        if (money) {
          totalPriceFromFood += money;
          foodIds.push(foodQuantityElement.parentElement.parentElement.querySelector('.food-id').innerText);
          quantities.push(foodQuantityElement.value);
        }
      }
      totalPriceFromFoodElement.innerText = Number(totalPriceFromFood).toLocaleString('vi');
    });
  });
}

function renderChooseFoodsUI() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/food`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { status, message, data } = result;
      if (status != 200) {
        window.location.href = '/';
        return;
      }
      renderTableListFoods(data);
    })
    .catch((error) => console.error(error));
}

renderChooseSeatUI();
