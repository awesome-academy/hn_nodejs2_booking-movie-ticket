const modalBodyOrderDetail = document.querySelector('#modalDetailOrder .modal-body');

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
}

const commentDate = document.querySelector('.comment-date');
const commentTextArea = document.querySelector('.comment-text-area');
const reviewIdElement = document.querySelector('#reviewId');

const starBlurElement = document.querySelector('.star-blur');
const btnSaveChanges = document.querySelector('.btn-save-changes');
const btnDelete = document.querySelector('.btn-delete');
const btnCancle = document.querySelector('.btn-cancle');

const csrfToken = document.querySelector('#_csrf').innerText;

function renderReviewDetail(item) {
  const timeSchedule = new Date(item.tickets[0].schedule).getTime();
  const now = new Date().getTime();
  if (
    timeSchedule >
    now + 3 * 24 * 60 * 60 * 1000 ||
    timeSchedule < now + 3 * 24 * 60 * 60 * 1000
  ) {
    btnSaveChanges.classList.add('d-none');
    btnDelete.classList.add('d-none');
    starBlurElement.classList.remove('d-none');
    commentTextArea.disabled = true;
    commentTextArea.readonly = true;
  }
  else {
    btnSaveChanges.classList.remove('d-none');
    btnDelete.classList.remove('d-none');
    starBlurElement.classList.add('d-none');
    commentTextArea.disabled = false;
    commentTextArea.readonly = false;
  }

  const movieId = item.movie.id;

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/review/one?movieId=${movieId}`, requestOptions)
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

btnSaveChanges.addEventListener('click', () => {
  let method = "POST";
  if (reviewIdElement.innerText) {
    method = "PUT";
  }
  const urlencoded = new URLSearchParams();
  urlencoded.append("billId", billId);
  urlencoded.append("comment", commentTextArea.value);
  urlencoded.append("star", getSelectedRadioValue('star'));
  urlencoded.append("_csrf", csrfToken);

  const requestOptions = {
    method: method,
    body: urlencoded,
    redirect: "follow"
  };

  fetch(`${protocol}//${host}/api/review`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { message, status, data } = result;
      btnCancle.click();
      if (status != 200 && status != 201) {
        Swal.fire({
          title: locale == 'vi' ? 'Lỗi' : 'Error',
          text: locale == 'vi' ? 'Thao tác bị lỗi' : 'The action incorrect',
          icon: 'error',
        });
        return;
      }
      Swal.fire({
        title: locale == 'vi' ? 'Thành công' : 'Success',
        text: locale == 'vi'
          ? (method == 'POST' ? 'Tạo đánh giá thành công' : 'Cập nhật đánh giá thành công')
          : (method == 'POST' ? 'Create Review Successfully' : 'Update Review Successfully'),
        icon: 'success',
      });
    })
    .catch((error) => console.error(error));
});

btnDelete.addEventListener('click', () => {
  Swal.fire({
    title: locale == 'vi' ? 'Thông báo' : 'Notify',
    text: locale == 'vi' ? 'Bạn có chắc chắn muốn xóa đánh giá không?' : 'Are you sure delete this review?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteReview();
    }
  });
});

function deleteReview() {
  const urlencoded = new URLSearchParams();
  urlencoded.append("billId", billId);
  urlencoded.append("_csrf", csrfToken);

  const requestOptions = {
    method: "DELETE",
    body: urlencoded,
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/review`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { message, status, data } = result;
      btnCancle.click();
      if (status != 200) {
        Swal.fire({
          title: locale == 'vi' ? 'Lỗi' : 'Error',
          text: locale == 'vi' ? 'Thao tác bị lỗi' : 'The action incorrect',
          icon: 'error',
        });
        return;
      }
      Swal.fire({
        title: locale == 'vi' ? 'Thành công' : 'Success',
        text: locale == 'vi' ? 'Xóa đánh giá thành công' : 'Delete Review Successfully',
        icon: 'success',
      });
    })
    .catch((error) => console.error(error));
}
