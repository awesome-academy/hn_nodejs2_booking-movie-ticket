const protocol = window.location.protocol;
const host = window.location.host;

const avatarElement = document.querySelector('.user-avatar');
const emailInput = document.querySelector('#email');
const usernameInput = document.querySelector('#username');
const phoneInput = document.querySelector('#phone');
const addressInput = document.querySelector('#address');
const avatarFileInput = document.querySelector('#upload-avatar');

const csrfTokenInput = document.querySelector('#_csrf');
const btnSaveChanges = document.querySelector('.btn-save-changes');
const helloUsername = document.querySelector('.hello-username');

const oldPasswordInput = document.querySelector('#oldPassword');
const newPasswordInput = document.querySelector('#newPassword');
const confirmPasswordInput = document.querySelector('#confirmPassword');
const btnSavePassword = document.querySelector('.btn-save-password');
const btnCancelModal = document.querySelector('.btn-cancle');

const locale = getCookie('locale');

const translate = {
  'username': 'Tên người dùng không được trống, độ dài tối đa 24 kí tự',
  'phone': 'Số điện thoại không đúng định dạng',
  'address': 'Địa chỉ có ít nhất 1 kí tự và tối đa 50 kí tự',
  'oldPassword': 'Mật khẩu cũ không khớp',
  'newPasword': 'Mật khẩu mới có độ dài từ 8 đến 24 kí tự',
  'confirmPassword': 'Xác nhận mật khẩu mới không khớp'
}

const translateEnglish = {
  'username': 'User name is not empty, maximum 24 characters long',
  'phone': 'The phone number is not in the correct format',
  'address': 'The address has a minimum of 1 character and a maximum of 50 characters',
  'oldPassword': 'Old Password not match',
  'newPasword': 'New Password length must be from 8 to 24 characters',
  'confirmPassword': 'Confirm Password not match'
}

let preview = null;

function clearNotiError(keys) {
  keys.forEach(key => {
    document.getElementById(key).classList.remove('is-invalid');
    const notiElement = document.getElementById(`noti-${key}`);
    notiElement.classList.add('d-none');
  });
}

function getUserInfoAndBindingForm() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  fetch(`${protocol}//${host}/api/user`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { status, message, data } = result;
      if (status != 200) {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = `${protocol}//${host}/`;
          }
        });
        return;
      }

      emailInput.value = data.email;
      usernameInput.value = data.username;
      phoneInput.value = data.phone;
      addressInput.value = data.address;
      csrfTokenInput.value = data.csrfToken;
      avatarElement.src = data.avatar;
    })
    .catch((error) => console.error(error));
}

avatarFileInput.addEventListener('change', () => {
  preview && URL.revokeObjectURL(preview);
  preview = URL.createObjectURL(avatarFileInput.files[0]);
  avatarElement.src = preview;
});

function savechanges() {
  const formdata = new FormData();
  formdata.append("username", usernameInput.value);
  formdata.append("phone", phoneInput.value);
  formdata.append("address", addressInput.value);
  formdata.append("avatar", avatarFileInput.files[0]);
  formdata.append("_csrf", csrfTokenInput.value);

  const requestOptions = {
    method: "PUT",
    body: formdata,
    redirect: "follow"
  };

  fetch(`${protocol}//${host}/api/user`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { status, message, data, errors } = result;
      if (status == 400) {
        clearNotiError(['username', 'phone', 'address']);

        if (Object.keys(errors).includes('isImageFileType')) {
          Swal.fire({
            title: locale == 'vi' ? 'Lỗi' : 'Error',
            text: locale == 'vi' ? 'Chỉ chấp nhận file ảnh' : 'Only accept image file',
            icon: 'error',
          }).then((rs) => {
            if (rs.isConfirmed) {
              window.location.href = '/personal-info';
            }
          });
          return;
        }

        if (Object.keys(errors).includes('isImageFileSize')) {
          Swal.fire({
            title: locale == 'vi' ? 'Lỗi' : 'Error',
            text: locale == 'vi' ? 'Kích thước file vượt quá 5MB' : 'File size over 5MB',
            icon: 'error',
          }).then((rs) => {
            if (rs.isConfirmed) {
              window.location.href = '/personal-info';
            }
          });
          return;
        }

        Object.keys(errors).forEach(key => {
          document.getElementById(key).classList.add('is-invalid');
          const notiElement = document.getElementById(`noti-${key}`);
          notiElement.classList.remove('d-none');
          notiElement.innerText = locale == 'vi' ? translate[key] : errors[key];
        });
        return;
      }

      if (status == 401) {
        Swal.fire({
          title: locale == 'vi' ? 'Lỗi' : 'Error',
          text: locale == 'vi' ? 'Thao tác cần xác thực' : 'Action can authorized',
          icon: "error",
        }).then(confirmed => {
          if (confirmed.isConfirmed) {
            window.location.href = '/authen/login';
          }
        });
        return;
      }

      Swal.fire({
        title: locale == 'vi' ? 'Thông báo' : 'Notify',
        text: locale == 'vi' ? 'Bạn đã thay đổi thông tin cá nhân thành công' : 'You changed your personal infomation successfully',
        icon: "success",
      }).then(confirmed => {
        if (confirmed.isConfirmed) {
          clearNotiError(['username', 'phone', 'address']);

          emailInput.value = data.email;
          usernameInput.value = data.username;
          phoneInput.value = data.phone;
          addressInput.value = data.address;
          avatarElement.src = data.avatar;
          helloUsername.innerText = data.username;
          preview && URL.revokeObjectURL(preview);
        }
      });
    })
    .catch((error) => console.error(error));
}

function savePassword() {
  const urlencoded = new URLSearchParams();
  urlencoded.append('_csrf', csrfTokenInput.value);
  urlencoded.append('oldPassword', oldPasswordInput.value);
  urlencoded.append('newPassword', newPasswordInput.value);
  urlencoded.append('confirmPassword', confirmPasswordInput.value);

  const requestOptions = {
    method: "PUT",
    body: urlencoded,
    redirect: "follow"
  };

  fetch(`${protocol}//${host}/api/user/change-password`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      const { status, message, data, errors } = result;
      if (status == 400) {
        clearNotiError(['oldPassword', 'newPassword', 'confirmPassword']);
        
        Object.keys(errors).forEach(key => {
          document.getElementById(key).classList.add('is-invalid');
          const notiElement = document.getElementById(`noti-${key}`);
          notiElement.classList.remove('d-none');
          notiElement.innerText = locale == 'vi' ? translate[key] : translateEnglish[key];
        });
        return;
      }

      if (status == 401) {
        btnCancelModal.click();
        Swal.fire({
          title: locale == 'vi' ? 'Lỗi' : 'Error',
          text: locale == 'vi' ? 'Thao tác cần xác thực' : 'Action can authorized',
          icon: "error",
        }).then(confirmed => {
          if (confirmed.isConfirmed) {
            window.location.href = '/authen/login';
          }
        });
        return;
      }

      clearNotiError(['oldPassword', 'newPassword', 'confirmPassword']);
      btnCancelModal.click();

      Swal.fire({
        title: locale == 'vi' ? 'Thông báo' : 'Notify',
        text: locale == 'vi' ? 'Bạn đã thay đổi mật khẩu thành công' : 'You changed your password successfully',
        icon: "success",
      });
    })
    .catch((error) => console.error(error));
}

btnSaveChanges.addEventListener('click', savechanges);
btnSavePassword.addEventListener('click', savePassword);

window.addEventListener('beforeunload', () => {
  preview && URL.revokeObjectURL(preview);
});

getUserInfoAndBindingForm();
