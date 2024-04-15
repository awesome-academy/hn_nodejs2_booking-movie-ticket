function getCookie(key) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(key + '=') === 0) {
      return cookie.substring(key.length + 1);
    }
  }
  return null;
}

function getSelectedRadioValue(name) {
  var radioButtons = document.getElementsByName(name);
  var selectedValue = null;
  for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      selectedValue = radioButtons[i].value;
      break;
    }
  }
  return selectedValue;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function debounce(callback, delay) {
  let timeout = null;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (callback instanceof Promise) {
        callback(...args).then(() => {});
      }
      else {
        callback(...args);
      }
    }, delay);
  }
}
