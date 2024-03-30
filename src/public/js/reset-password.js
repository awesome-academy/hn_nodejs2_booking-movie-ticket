Swal.fire({
  title: 'Notify',
  text: 'You have successfully changed your password!',
  icon: 'success',
  confirmButtonText: 'OK'
}).then((result) => {
  if (result.isConfirmed) {
    window.location.href = `${window.location.protocol}//${window.document.domain}:${window.location.port}/authen/login`;
  }
});
