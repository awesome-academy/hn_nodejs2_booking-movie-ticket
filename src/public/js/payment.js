const btnPay = document.querySelector('.btn-pay');
btnPay.addEventListener('click', () => {
  const payType = document.querySelector('.choose-type-pay-online').value;
  const urlencoded = new URLSearchParams();

  urlencoded.append('scheduleId', scheduleId);
  for (let seatId of seatIds) {
    urlencoded.append('seatIds', seatId);
  }
  for (let foodId of foodIds) {
    urlencoded.append('foodIds', foodId);
  }
  for (let quantity of quantities) {
    urlencoded.append('quantities', quantity);
  }
  urlencoded.append('payType', payType);
  
  const requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/bill`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { message, status, errors, data } = result;
      if (status != 200) {
        Swal.fire({
          title: `${locale == 'vi' ? 'Lỗi' : 'Error'}`,
          text: Object.values(errors)[0],
          icon: 'error',
        });
        return;
      }

      window.location.href = data.redirect;
    })
    .catch((error) => console.error(error));
});
