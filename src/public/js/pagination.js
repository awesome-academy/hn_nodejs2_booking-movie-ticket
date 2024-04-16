const pagination = document.querySelector('.pagination');

function renderPagination(data, nodeClickHandler, queryParamHandler) {
  if (!data) {
    pagination.innerHTML = '';
    return;
  }
  
  const { page, prevPage, nextPage, startNode, endNode } = data;
  
  if (endNode == 1) {
    pagination.innerHTML = '';
    return;
  }
  
  const locale = getCookie('locale');
  let html = '';
  
  html += `
    <li class="page-item${prevPage ? '' : ' disabled'}" ${prevPage ? 'style="cursor: pointer;"' : ''}>
      <span class="page-number d-none">${prevPage}</span>
      <span class="page-link">${locale == 'en' ? 'Previous' : 'Trang trước'}</span>
    </li>
  `;
  
  for (let i = startNode; i <= endNode; i++) {
    html += `
      <li class="page-item${i == page ? ' active' : ''}" style="cursor: pointer;">
        <span class="page-link page-number">${i}</span>
      </li>
    `;
  }

  html += `
    <li class="page-item${nextPage ? '' : ' disabled'}" ${nextPage ? 'style="cursor: pointer;"' : ''}>
      <span class="page-number d-none">${nextPage}</span>
      <span class="page-link">${locale == 'en' ? 'Next' : 'Trang sau'}</span>
    </li>
  `;

  pagination.innerHTML = html;
  pagination.querySelectorAll('.page-item').forEach(item => {
    const pageNumber = item.querySelector('.page-number').innerText;
    item.addEventListener('click', () => {
      if (pageNumber == 'null') return;
      _page = pageNumber;
      queryParamHandler();
      nodeClickHandler(true);
    });
  });
}
