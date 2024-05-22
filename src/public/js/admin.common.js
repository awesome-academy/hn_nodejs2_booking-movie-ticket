function saveStatePage() {
  const path = `${window.location.pathname}${window.location.search}`;
  if (path.includes('admin')) {
    setCookie('currentPath', path);
    return;
  }
}
saveStatePage();

document.querySelectorAll('.dropdown-item label').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

document.querySelectorAll('.dropdown-item select').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});
