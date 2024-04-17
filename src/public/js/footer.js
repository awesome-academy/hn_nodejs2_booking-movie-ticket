const button = document.querySelector('.btn-to-top');

const displayButton = () => {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  });
};

const scrollToTop = () => {
  button.addEventListener('click', () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    }); 
  });
};

displayButton();
scrollToTop();

const commonPaths = ['/movie-details', '/all-movies', '/'];
function saveStatePage() {
  const path = `${window.location.pathname}${window.location.search}`;
  commonPaths.forEach(item => {
    if (path.includes(item) && !path.includes('/authen')) {
      setCookie('currentPath', path);
      return;
    }
  });
}

saveStatePage();
