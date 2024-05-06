function renderNoDataUI() {
  const locale = getCookie('locale');
  document.body.parentElement.innerHTML = `
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/css/no.data.css" />
      <link rel="icon" type="image/x-icon" href="/icon/icon-cinema.ico">
      <title>NAMCINEMA | ${locale == 'vi' ? 'Không có dữ liệu' : 'No Data'}</title>
    </head>

    <body>
      <h1><a href="/">${locale == 'vi' ? 'Quay lại trang chủ' : 'Back To Home'}</a></h1>
      <p>${locale == 'vi' ? 'Không có dữ liệu' : 'No Data'}</p>
      <div class="travolta"></div>
    </body>
  `;
}
