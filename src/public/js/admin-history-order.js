let querySearch = null;

let _page = null;
let _orderDate = null;
let _orderPrice = null;
let _itemInPage = 9;

function initQueryParam() {
  querySearch = new URLSearchParams(window.location.search);
  _page = querySearch.get('page') ? +querySearch.get('page') : 1;
  _orderDate =
    querySearch.get('orderDate') == '1' || querySearch.get('orderDate') == '0'
      ? querySearch.get('orderDate')
      : '0';
      _orderPrice =
    querySearch.get('orderPrice') == '1' || querySearch.get('orderPrice') == '0'
      ? querySearch.get('orderPrice')
      : '0';
}

let dataResponse = null;

const translate = {
  vi: {
    numericalOrder: "STT",
    billCode: "Mã hóa đơn",
    movieName: "Tên phim",
    orderDate: "Ngày đặt",
    totalPrice: "Tổng tiền",
    action: "Thao tác",
    noResult: "Không kết quả",
    detail: "Chi tiết",
    review: "Đánh giá",
    billTotalPriceFromTicket: "Tổng tiền vé",
    billTotalPriceFromFood: "Tổng tiền đồ ăn",
    billStatus: "Trạng thái",
    billType: "Loại",
    billBankCode: "Mã ngân hàng",
    billTranNo: "Mã giao dịch",
    billPayTime: "Ngày đặt",
    billTotalPrice: "Tổng tiền",
    ticketDetail: "Chi tiết vé",
    ticketCode: "Mã vé",
    ticketSeat: "Ghế",
    ticketType: "Loại",
    ticketPrice: "Giá",
    ticketRoom: "Phòng",
    ticketSchedule: "Lịch chiếu",
    ticketAction: "Thao tác",
    ticketReject: "Từ chối",
    ticketViewReject: "Xem lý do",
    ticketViewed: "Đã xem",
    foodDetail: "Chi tiết đồ ăn",
    foodCode: "Mã đồ ăn",
    foodImage: "Ảnh",
    foodPrice: "Giá",
    foodQuantity: "Số lượng",
    foodDescription: "Mô tả",
    reviewLastUpdate: "Cập nhật lần cuối",
  },
  en: {
    numericalOrder: "Numerical Order",
    billCode: "Bill Code",
    movieName: "Movie Name",
    orderDate: "Order Date",
    totalPrice: "Total Price",
    action: "Action",
    noResult: "No Result",
    detail: "Detail",
    review: "Review",
    billTotalPriceFromTicket: "Total price from ticket",
    billTotalPriceFromFood: "Total price from food",
    billStatus: "Status",
    billType: "Type",
    billBankCode: "Bank code",
    billTranNo: "Bank Tran No",
    billPayTime: "Pay time",
    billTotalPrice: "Total price",
    ticketDetail: "Ticket Detail",
    ticketCode: "Ticket Code",
    ticketSeat: "Seat",
    ticketType: "Type",
    ticketPrice: "Price",
    ticketRoom: "Room",
    ticketSchedule: "Schedule",
    ticketAction: "Action",
    tikcetReject: "Reject",
    ticketViewReject: "View reject",
    ticketViewed: "Viewed",
    foodDetail: "Food Detail",
    foodCode: "Food Code",
    foodImage: "Image",
    foodPrice: "Price",
    foodQuantity: "Quantity",
    foodDescription: "Description",
    reviewLastUpdate: "Last update",
  }
}

const protocol = window.location.protocol;
const host = window.location.host;
const locale = getCookie('locale');

const dropdownMenu = document.querySelector('.dropdown-menu');
dropdownMenu.addEventListener('click', debounce(dropdownMenuClickHandler, 500));

const wapperBillList = document.querySelector('.wapper-bill-list');
const lazyloading = new Lazyloading(wapperBillList);
let billId = null;

function dropdownMenuClickHandler(event) {
  if (event.target.tagName.toLowerCase() != 'input') return;

  if (event.target.name == 'orderDate') {
    _orderDate = getValueRadioGroup('orderDate');
  } else {
    _orderPrice = getValueRadioGroup('orderPrice');
  }
  renderListBills(true);
  queryParamHandler();
}

const dateEarlyRadioInput = document.querySelector('#dateEarly');
const dateLatestRadioInput = document.querySelector('#dateLatest');
const priceLowestRadioInput = document.querySelector('#priceLowest');
const priceHighestRadioInput = document.querySelector('#priceHighest');

function bindingDropdownInput() {
  if (_orderDate == '1') {
    dateLatestRadioInput.checked = true;
  } else {
    dateEarlyRadioInput.checked = true;
  }

  if (_orderPrice == '1') {
    priceHighestRadioInput.checked = true;
  } else {
    priceLowestRadioInput.checked = true;
  }
}

function queryParamHandler() {
  const queryParam = `?page=${_page}&orderDate=${_orderDate}&orderPrice=${_orderPrice}`;
  window.history.pushState(null, null, queryParam);
}

const tableBillList = document.querySelector('.table-bill-list');

function renderNoData() {
  const locale = getCookie('locale');
  const html = `
    <div class="d-flex mb-5 flex-column mt-5" style="width: 100%">
      <img src="/img/no-result.png" class="mr-auto ml-auto mb-0 mt-5"/>
      <span class="mr-auto ml-auto mb-5 mt-0">${translate[locale].noResult}</span>
    </div>
  `;
  tableBillList.innerHTML = html;
}

function renderUIWithDataFromAPI(data) {
  let html = `
    <thead class="thead-dark">
      <tr>
        <th scope="col">${translate[locale].numericalOrder}</th>
        <th scope="col">${translate[locale].billCode}</th>
        <th scope="col">${translate[locale].movieName}</th>
        <th scope="col">${translate[locale].orderDate}</th>
        <th scope="col">${translate[locale].totalPrice}</th>
        <th scope="col">${translate[locale].action}</th>
      </tr>
    </thead>
  `;

  dataResponse = data;
  let htmltrs = '';
  const items = data.items;
  for (let i = 0; i < items.length; i++) {
    const item  = items[i];
    htmltrs += `
      <tr>
        <span class="movie-id d-none">${item.movie.id}</span>
        <th scope="row">${(data.page - 1) * data.itemInPage + 1 + i}</th>
        <td class="text-danger">BILL${item.id}</td>
        <td><a href="/movie-details/${item.movie.id}">${item.movie.name}</a></td>
        <td>01/01/2024 12:12:12</td>
        <td>${Number(item.totalPrice).toLocaleString('vi')} <span class="text-danger">VNĐ</span></td>
        <td>
          <button type="button" class="btn btn-info btn-order-detail" data-toggle="modal" data-target="#modalDetailOrder" data-whatever="@getbootstrap">
            <i class="fa-solid fa-list"></i>&nbsp;
            ${translate[locale].detail}
          </button>
          <button type="button" class="btn btn-primary ml-2 btn-movie-review" data-toggle="modal" data-target="#modalReview" data-whatever="@getbootstrap">
            <i class="fa-solid fa-pen-to-square"></i>&nbsp;
            ${translate[locale].review}
          </button>
        </td>
      </tr>
    `;
  }

  html += `<tbody>${htmltrs}</tbody>`;
  tableBillList.innerHTML = html;

  document.querySelectorAll('.btn-order-detail').forEach((item, index) => {
    item.addEventListener('click', () => {
      renderUIOrderDetail(items[index]);
    });
  });

  document.querySelectorAll('.btn-movie-review').forEach((item, index) => {
    item.addEventListener('click', () => {
      billId = items[index].id;
      renderReviewDetail(items[index]);
    });
  });
}

function renderListBills(isClickNodePagination = false) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  if (isClickNodePagination) lazyloading.start();
  
  fetch(`${protocol}//${host}/api/bill?page=${_page}&orderDate=${_orderDate}&orderPrice=${_orderPrice}&itemInPage=${_itemInPage}`, requestOptions)
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
        tableBillList.innerHTML = '';
        pagination.innerHTML = '';
        if (isClickNodePagination) lazyloading.close();
        renderNoData();
        return;
      }
      if (isClickNodePagination) {
        await sleep(700);
        renderUIWithDataFromAPI(data);
        renderPagination(data, renderListBills, queryParamHandler);
        lazyloading.close();
      } else {
        renderUIWithDataFromAPI(data);
        renderPagination(data, renderListBills, queryParamHandler);
      }
    })
    .catch((error) => console.error(error));
}

window.addEventListener('popstate', () => {
  initQueryParam();
  bindingDropdownInput();
  renderListBills();
});

const btnExportExcel = document.querySelector('.btn-export-excel');
btnExportExcel.addEventListener('click', () => {
  exportExcel(dataResponse.items, _page);
});

initQueryParam();
bindingDropdownInput();
renderListBills();
queryParamHandler();
