Swal.fire({
  title: 'Notify',
  text: 'We have sent you an email to reset your password\nPlease check your email',
  icon: 'success',
  confirmButtonText: 'OK'
}).then((result) => {
  if (result.isConfirmed) {
    window.location.href = `${window.location.protocol}//${window.document.domain}:${window.location.port}/authen/login`;
  }
});
