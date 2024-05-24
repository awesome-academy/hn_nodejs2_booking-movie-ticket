const modalBodyOrderDetail = document.querySelector('#modalDetailOrder .modal-body');

const rejectTextarea = document.querySelector('.reject-text-area');
let saveChangesFlag = 0;
let btnReject = null;
let currentTicket = null;
const btnCancleModalViewReject = document.querySelector('.btn-cancle-modal-view-reject');

function checkValidTime(dateString) {
  const timeSchedule = new Date(
    convertDateStringFromDDMMYYYYHHmmssToYYYYMMDDHHmmss(dateString)
  );
  const now = new Date().getTime();
  return now < timeSchedule;
}

function renderUIOrderDetail(obj) {
  let html = `
    <table class="bill-detail-common">
    <tr>
      <th><b>${translate[locale].billCode}:</b></th>
      <th>BILL${obj.id}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].movieName}:</b></th>
      <th>${obj.movie.name}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billTotalPriceFromTicket}:</b></th>
      <th>${Number(obj.totalPriceFromTicket).toLocaleString('vi')} <span class="text-danger">VNĐ</span></th>
    </tr>
    <tr>
      <th><b>${translate[locale].billTotalPriceFromFood}:</b></th>
      <th>${Number(obj.totalPriceFromFood).toLocaleString('vi')} <span class="text-danger">VNĐ</span></th>
    </tr>
    <tr>
      <th><b>${translate[locale].billStatus}:</b></th>
      <th class="text-success">${obj.status}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billType}:</b></th>
      <th>${obj.type}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billBankCode}:</b></th>
      <th>${obj.bankCode}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billTranNo}:</b></th>
      <th>${obj.bankTranNo}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billPayTime}:</b></th>
      <th>${obj.payTime}</th>
    </tr>
    <tr>
      <th><b>${translate[locale].billTotalPrice}:</b></th>
      <th>${Number(obj.totalPrice).toLocaleString('vi')} <span class="text-danger">VNĐ</span></th>
    </tr>
  </table>
  `;

  let htmlTicket = `
    <h3 class="text-center my-3">${translate[locale].ticketDetail}</h3>
    <table class="table table-striped">
      <thead class="thead-dark">
        <tr>
          <th scope="col">${translate[locale].numericalOrder}</th>
          <th scope="col">${translate[locale].ticketCode}</th>
          <th scope="col">${translate[locale].ticketSeat}</th>
          <th scope="col">${translate[locale].ticketType}</th>
          <th scope="col">${translate[locale].ticketPrice}</th>
          <th scope="col">${translate[locale].ticketRoom}</th>
          <th scope="col">${translate[locale].ticketSchedule}</th>
          <th scope="col">${translate[locale].ticketAction}</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (let i = 0; i < obj.tickets.length; i++) {
    const ticket = obj.tickets[i];
    htmlTicket += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td class="text-danger">TICKET${ticket.id}</td>
        <td>${ticket.seat}</td>
        <td>${ticket.type}</td>
        <td>${Number(ticket.price).toLocaleString('vi')} <span class="text-danger">VNĐ</span></td>
        <td>${ticket.room}</td>
        <td>${ticket.schedule}</td>
        <td>
          <button type="button" class="btn btn-danger btn-reject ${!ticket.reasonReject && checkValidTime(ticket.schedule) ? '' : 'd-none'}"
            data-toggle="modal" data-target="#modalReject" data-whatever="@getbootstrap"
          >
            <span>${translate[locale].ticketReject}</span>&nbsp;
            <i class="fa-solid fa-square-xmark"></i>
          </button>
          <button type="button" class="btn btn-info btn-view-reject ${ticket.reasonReject ? '' : 'd-none'}"
            data-toggle="modal" data-target="#modalReject" data-whatever="@getbootstrap"
          >
            <span>${translate[locale].ticketViewReject}</span>&nbsp;
            <i class="fa-solid fa-eye"></i>
          </button>
          <div class="text-success ${!ticket.reasonReject && !checkValidTime(ticket.schedule) ? '' : 'd-none'}">
            ${translate[locale].ticketViewed}
          </div>
        </td>
      </tr>
    `;
  }
  htmlTicket += '</tbody></table>';

  let htmlFood = `
    <h3 class="text-center mt-5 mb-3">${translate[locale].foodDetail}</h3>
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
  for (let i = 0; i < obj.purchasedFoods.length; i++) {
    const food = obj.purchasedFoods[i];
    htmlFood += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td class="text-danger">FOOD${food.id}</td>
        <td><image src="${food.image}" width="64px" height="64px" style="border-radius: 50%;" /></td>
        <td>${Number(food.price).toLocaleString('vi')} <span class="text-danger">VNĐ</span></td>
        <td>${food.quantity}</td>
        <td>${food.description}</td>
      </tr>
    `;
  }
  htmlFood += '</tbody></table>';

  html = html + htmlTicket + htmlFood;
  modalBodyOrderDetail.innerHTML = html;

  document.querySelectorAll('.btn-reject').forEach((item, index) => {
    item.addEventListener('click', () => {
      saveChangesFlag = 0;
      btnReject = item;
      btnSaveChanges.classList.remove('d-none');
      currentTicket = obj.tickets[index];
      rejectTextarea.value = '';
      rejectTextarea.disabled = false;
      rejectTextarea.readonly = false;
    });
  });

  document.querySelectorAll('.btn-view-reject').forEach((item, index) => {
    item.addEventListener('click', () => {
      saveChangesFlag = 1;
      btnSaveChanges.classList.add('d-none');
      rejectTextarea.value = obj.tickets[index].reasonReject;
      rejectTextarea.disabled = true;
      rejectTextarea.readonly = true;
    });
  });
}

const btnSaveChanges = document.querySelector('.btn-save-changes');
btnSaveChanges.addEventListener('click', () => {
  if (saveChangesFlag == 0) {
    updateReasonReject(btnReject, btnReject.nextElementSibling, currentTicket);
  }
});

var csrfToken = document.querySelector('#_csrf').innerText;

async function updateReasonReject(btnReject, btnViewReject, ticket) {
  const urlencoded = new URLSearchParams();
  urlencoded.append("_csrf", csrfToken);
  urlencoded.append("ticketId", ticket.id);
  if (saveChangesFlag == 0) {
    urlencoded.append("reasonReject", rejectTextarea.value);
  }

  const requestOptions = {
    method: "PUT",
    body: urlencoded,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${protocol}//${host}/api/ticket/update-reason`, requestOptions);
    const data = await response.json();

    if (data.status != 200) {
      throw data;
    }

    ticket.reasonReject = data.data;

    Swal.fire({
      title: locale == "vi" ? "Thành công" : "Success",
      text: locale == "vi" ? "Cập nhật lý do thành công" : "Update reject reason success",
      icon: "success",
    }).then((result) => {
      if (result.isConfirmed && saveChangesFlag == 0) {
        btnReject.classList.add('d-none');
        btnViewReject.classList.remove('d-none');
        btnCancleModalViewReject.click();
      }
    });
  } catch (error) {
    console.log(error);

    Swal.fire({
      title: locale == "vi" ? "Lỗi" : "Error",
      text: error.message,
      icon: "error",
    });
  }
}

const commentDate = document.querySelector('.comment-date');
const commentTextArea = document.querySelector('.comment-text-area');
const reviewIdElement = document.querySelector('#reviewId');

function convertDateStringFromDDMMYYYYHHmmssToYYYYMMDDHHmmss(dateString) {
  const arr = dateString.split(' ')[0].split('-');
  return `${arr[2]}-${arr[1]}-${arr[0]} ${dateString.split(' ')[1]}`;
}

function renderReviewDetail(item) {
  const movieId = item.movie.id;

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/review/one?movieId=${movieId}&userId=${item.userId}`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { message, status, data } = result;
      if (status !== 200) {
        alert(message);
        window.location.href = '/';
        return;
      }

      if (data == null) {
        commentDate.innerText = '';
        commentDate.classList.add('d-none');
        makeStarActiveAndInActive(0);
        commentTextArea.value = '';
        reviewIdElement.innerText = '';
        btnDelete.classList.add('d-none');
        return;
      }

      commentDate.innerText = `${translate[locale].reviewLastUpdate}: ${data.updatedAt}`;
      commentDate.classList.remove('d-none');
      commentTextArea.value = data.comment;
      makeStarActiveAndInActive(data.star - 1);
      reviewIdElement.innerText = data.id;
    })
    .catch((error) => console.error(error));
}
