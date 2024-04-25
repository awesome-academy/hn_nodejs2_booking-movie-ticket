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

function setCookie(key, value, millisecondsToExpire = null) {
  if (millisecondsToExpire) { 
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + millisecondsToExpire);
    const expires = `expires=${expirationDate.toUTCString()}`;
    document.cookie = `${key}=${value}; ${expires}; path=/`;
  } else {
    const expirationDate = new Date('Fri, 31 Dec 9999 23:59:59 GMT');
    document.cookie = `${key}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  }
}

function deleteCookie(key) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
      clearTimeout(timeout);
    }, delay);
  }
}

function getValueRadioGroup(name) {
  const radioGroup = document.querySelectorAll(`input[name=${name}]`);
  for (item of radioGroup) {
    if (item.checked == true) {
      return item.value;
    }
  }
  return null;
}
