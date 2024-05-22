var largImageInput = document.querySelector('#largeImgurl');
var smallImageInput = document.querySelector('#smallImgurl');
const previews = [null, null];

let categories = null;

[largImageInput, smallImageInput].forEach((item, index) => {
  item.addEventListener('input', () => {
    const imageTag = item.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild;
    if (!item.files?.[0]) {
      imageTag.src = '/img/no-result.png';
      return;
    }
    previews[index] = URL.createObjectURL(item.files[0]);
    imageTag.src = previews[index];
  });
});

window.addEventListener('beforeunload', () => {
  previews.forEach(preview => {
    preview && URL.revokeObjectURL(preview);
  });
});

function clearDataModal() {
  nameInput.value = '';
  directionInput.value = '';
  actorsInput.value = '';
  trailerInput.value = '';
  languageInput.value = '';
  durationInput.value = '';
  ageLimitInput.value = '';
  releaseDateInput.value = '';
  startDateShowingInput.value = '';
  endDateShowingInput.value = '';
  largeImageInput.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.src = '/img/no-result.png';
  smallImageInput.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.src = '/img/no-result.png';
  shortDescriptionInput.value = '';
  longDescriptionInput.value = '';

  ctgItems.forEach(item => {
    item.checked = false;
  });
}

function turnOffInvalidInputFeedback() {
  [...document.querySelectorAll('input'), ...document.querySelectorAll('textarea')].forEach(inputElement => {
    const invalidFeedbackElement = inputElement.nextElementSibling;

    if (!invalidFeedbackElement) return;
    
    inputElement.classList.remove('is-invalid');
    invalidFeedbackElement.classList.add('d-none');
    invalidFeedbackElement.innerText = '';
  });
}

const btnAddNewMovie = document.querySelector('.btn-add-new-movie');
btnAddNewMovie.addEventListener('click', () => {
  modalTitle.innerText = translate[locale].addNewMovie;
  modalFlag = 0;
  clearDataModal();
});
