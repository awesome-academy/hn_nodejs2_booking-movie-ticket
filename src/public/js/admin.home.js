let locale = getCookie('locale');

const protocol = window.location.protocol;
const host = window.location.host;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomColors(length) {
  let colors = new Set();
  while (colors.size < length) {
    let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    if (color != '#ffffff') {
      colors.add(color);
    }
  }
  return Array.from(colors);
}

let lineChart = null;
function drawLineChart(data) {
  let canvas = document.querySelector('.my-chart');
  if (lineChart != null) {
    lineChart.destroy();
  }
  let labels = [];

  if (data.length == 0) {
    data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({
        id: i,
        name: `Hello World ${i}`,
        revenue: getRandomInt(1000000, 10000000),
      });
    }
    data.sort((o1, o2) => o2.revenue - o1.revenue);
  }

  for (let i = 1; i <= data.length; i++) {
    labels.push('TOP ' + i);
  }
  
  let color = generateRandomColors(1);

  let config = {
    type: 'line',
    data: {
      labels: labels, // các nhãn trên trục hoành
      // Tập hợp các đường
      datasets: [
        {
          label: locale == 'vi' ? 'Doanh thu' : 'Revenue', // Tên của đường
          // data: data.map(item => item.revenue), // dữ liệu của đường tương ứng với nhãn trên trục hoành
          data: data.map(item => item.revenue),
          backgroundColor: color, // màu của đường
          borderColor: color,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (tooltipItem) {
              // return 'Sales: ' + tooltipItem.dataIndex;
              const index = tooltipItem.dataIndex;
              // return `${data[index].name}: ${data[index].revenue} VNĐ`;
              return `${data[index].name}: ${Number(data[index].revenue).toLocaleString('vi')} VNĐ`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: locale == 'vi' ? 'Phim' : 'Movie',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: locale == 'vi' ? 'Doanh thu (VNĐ)' : 'Revenue (VNĐ)',
          },
        },
      },
    },
  };

  lineChart = new Chart(canvas.getContext('2d'), config);
}

// drawLineChart([25, 30, 35, 15, 10, 37, 40, 46, 50, 35]);

const movieCountValue = document.querySelector('.movie-count-value');
const ticketCountValue = document.querySelector('.ticket-count-value');
const userCountValue = document.querySelector('.user-count-value');
const revenueMonthValue = document.querySelector('.revenue-month-value');

const TIME_LIMIT_STATISTIC_MOVIE_REVENUE = 7 * 24 * 60 * 60 * 1000;

async function bindingDataToUI() {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(new Date(endDate).getTime() - TIME_LIMIT_STATISTIC_MOVIE_REVENUE).toISOString().split('T')[0];
  
  let [summaryStatisticPromise, summaryDrawChartPromise] = await Promise.all([
    fetch(`${protocol}//${host}/api/admin`, {
      method: "GET",
      redirect: "follow",
    }),
    fetch(`${protocol}//${host}/api/admin/statistic-revenue?startDate=${startDate}&endDate=${endDate}`, {
      method: "GET",
      redirect: "follow",
    }),
  ]);

  let [summaryStatistic, summaryDrawChart] = await Promise.all([
    summaryStatisticPromise.json(), summaryDrawChartPromise.json(),
  ]);

  movieCountValue.innerText = summaryStatistic.data.movieCount;
  ticketCountValue.innerText = summaryStatistic.data.ticketCount;
  userCountValue.innerText = summaryStatistic.data.userCount;
  revenueMonthValue.innerText = Number(summaryStatistic.data.revenue).toLocaleString('vi');

  drawLineChart(summaryDrawChart.data);
}

const startDateInput = document.querySelector('#startDate');
const endDateInput = document.querySelector('#endDate');
const btnDrawChart = document.querySelector('.btn-draw-chart');

const ADMIN_STATISTIC_MOVIE_TIME_LIMIT = 30 * 24 * 60 * 60 * 1000;

endDateInput.max = new Date().toISOString().split('T')[0];
endDateInput.value = endDateInput.max;
startDateInput.value = new Date(
  new Date(endDateInput.value).getTime()
  - ADMIN_STATISTIC_MOVIE_TIME_LIMIT
).toISOString().split('T')[0];

function bindingTimeRange(endDateTimeRangeInput) {
  startDateInput.max = endDateTimeRangeInput.value;
  startDateInput.min = new Date(
    new Date(endDateTimeRangeInput.value).getTime()
    - ADMIN_STATISTIC_MOVIE_TIME_LIMIT
  ).toISOString().split('T')[0];
  startDateInput.value = '';
}

endDateInput.addEventListener('input', () => {
  bindingTimeRange(endDateInput);
});

startDateInput.max = endDateInput.max;
startDateInput.min = new Date(new Date(endDateInput.max).getTime() - ADMIN_STATISTIC_MOVIE_TIME_LIMIT);

btnDrawChart.addEventListener('click', async () => {
  try {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    const response = await fetch(`${protocol}//${host}/api/admin/statistic-revenue?startDate=${startDate}&endDate=${endDate}`, {
      method: "GET",
      redirect: "follow",
    });
  
    const data = await response.json();
    if (data.status != 200) {
      throw data;
    }

    drawLineChart(data.data);
  } catch (error) {
    console.log(error);
    if (!error.errors) return;

    Swal.fire({
      title: locale == "vi" ? "Lỗi" : "Error",
      text: Object.values(error.errors)[0],
      icon: "error",
    });
  }
});

bindingDataToUI();
