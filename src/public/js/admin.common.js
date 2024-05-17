function saveStatePage() {
  const path = `${window.location.pathname}${window.location.search}`;
  if (path.includes('admin')) {
    setCookie('currentPath', path);
    return;
  }
}
saveStatePage();
