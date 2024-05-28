var movieIdInput = document.querySelector('#movieId');
var roomIdInput = document.querySelector('#roomId');
var startDateInput = document.querySelector('#startDate');
var startTimeInput = document.querySelector('#startTime');
var btnOk = document.querySelector('.btn-ok');
var csrfToken = document.querySelector('#_csrf').innerText;

function turnOff(inputElement) {
  inputElement.disabled = true;
  inputElement.readonly = true;
  btnOk.classList.add('invisible');
}

function turnOn(inputElement) {
  inputElement.disabled = false;
  inputElement.readonly = false;
  btnOk.classList.remove('invisible');
}

function bindingScheduleInModal(schedulesIndex) {
  movieIdInput.value = schedules[schedulesIndex].movie.name;
  roomIdInput.value = `${schedules[schedulesIndex].room.name} -- ${schedules[schedulesIndex].room.capacity} ${translate[locale].seat} -- ${schedules[schedulesIndex].room.totalArea} m2`;
  startDateInput.value = schedules[schedulesIndex].startDate;
  startTimeInput.value = schedules[schedulesIndex].startTime;

  movieId = schedules[schedulesIndex].movie.id;
  roomId = schedules[schedulesIndex].room.id;

  const timeShow = new Date(
    schedules[schedulesIndex].startDate + ' ' + schedules[schedulesIndex].startTime
  );
  const now = new Date();
  if (timeShow < now) {
    turnOff(movieIdInput);
    turnOff(startDateInput);
    turnOff(startTimeInput);
    turnOff(roomIdInput);
  }
  else {
    turnOn(movieIdInput);
    turnOn(startDateInput);
    turnOn(startTimeInput);
    turnOn(roomIdInput);
  }
}

btnOk.addEventListener('click', () => {
  saveSchedule();
});

async function saveSchedule() {
  const urlencoded = new URLSearchParams();
  urlencoded.append("_csrf", csrfToken);
  urlencoded.append("movieId", movieId);
  urlencoded.append("roomId", roomId);
  urlencoded.append("startDate", startDateInput.value);
  urlencoded.append("startTime", startTimeInput.value);

  const requestOptions = {
    method: modalFlag == 1 ? "PUT" : "POST",
    body: urlencoded,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${protocol}//${host}/api/schedule${modalFlag == 0 ? '' : '/'+schedules[globalSchedulesIndex].id}`, requestOptions);
    const data = await response.json();
    if (data.status != 200 && data.status != 201) {
      throw data;
    }

    Swal.fire({
      title: locale == 'vi' ? 'Thành công' : 'Success',
      text: `${modalFlag == 0 ? 'Thêm' : 'Cập nhật'} lịch chiếu thành công`,
      icon: 'success',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  } catch (error) {
    console.log(error);
    if (!error.errors) return;

    Swal.fire({
      title: locale == 'vi' ? 'Lỗi' : 'Error',
      text: Object.values(error.errors)[0],
      icon: 'error',
    });
  }
}

async function changeScheduleStatus(scheduleId, status) {
  const locale = getCookie('locale');

  const urlencoded = new URLSearchParams();
  urlencoded.append("_csrf", csrfToken);
  urlencoded.append("status", status);

  const requestOptions = {
    method: "PUT",
    body: urlencoded,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${protocol}//${host}/api/schedule/change-status/${scheduleId}`, requestOptions);
    const data = await response.json();
    
    if (data.status != 200) {
      throw data;
    }

    Swal.fire({
      title: locale == "vi" ? "Thành công" : "Success",
      text: locale == "vi" ? "Cập nhật trạng thái của lịch chiếu thành công" : "Update schedule status success",
      icon: "success",
    });
  } catch (error) {
    console.log(error);
    if (!error.errors) return;

    Swal.fire({
      title: locale == "vi" ? "Lỗi" : "Error",
      text: Object.values(error.errors)[0],
      icon: "error",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  }
}
