var locale = getCookie('locale');

var nameInput = document.querySelector('#name');
var directionInput = document.querySelector('#direction');
var actorsInput = document.querySelector('#actors');
var trailerInput = document.querySelector('#trailer');
var languageInput = document.querySelector('#language');
var ctgItems = document.querySelectorAll('.ctg-item');
var durationInput = document.querySelector('#duration');
var ageLimitInput = document.querySelector('#ageLimit');
var releaseDateInput = document.querySelector('#releaseDate');
var startDateShowingInput = document.querySelector('#startDateShowing');
var endDateShowingInput = document.querySelector('#endDateShowing');
var largeImageInput = document.querySelector('#largeImgurl');
var smallImageInput = document.querySelector('#smallImgurl');
var shortDescriptionInput = document.querySelector('#shortDescription');
var longDescriptionInput = document.querySelector('#longDescription');

function bindingMovieInModal(moviesIndex) {
  const movie = movies[moviesIndex];
  nameInput.value = movie.name;
  directionInput.value = movie.direction;
  actorsInput.value = movie.actors;
  trailerInput.value = movie.trailerurl;
  languageInput.value = movie.language;
  durationInput.value = movie.duration;
  ageLimitInput.value = movie.ageLimit;
  releaseDateInput.value = movie.releaseDate;
  startDateShowingInput.value = movie.startDateShowing;
  endDateShowingInput.value = movie.endDateShowing;
  largeImageInput.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.src = movie.largeImgurl;
  smallImageInput.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.src = movie.smallImgurl;
  shortDescriptionInput.value = movie.shortDescription;
  longDescriptionInput.value = movie.longDescription;
  
  ctgItems.forEach(item => {
    item.checked = false;
  });

  ctgItems.forEach(item => {
    for (let category of movie.categories) {
      if (item.value == category.id) {
        item.checked = true;
      }
    }
  });
}

async function saveMovie() {
  const formdata = new FormData();
  formdata.append("duration", durationInput.value);
  formdata.append("direction", directionInput.value);
  formdata.append("actors", actorsInput.value);

  if (largeImageInput?.files?.length) {
    formdata.append("largeImgurl", largeImageInput.files[0]);
  }
  
  if (smallImageInput?.files?.length) {
    formdata.append("smallImgurl", smallImageInput.files[0]);
  }

  formdata.append("startDateShowing", startDateShowingInput.value);
  formdata.append("endDateShowing", endDateShowingInput.value);
  formdata.append("longDescription", longDescriptionInput.value);
  formdata.append("shortDescription", shortDescriptionInput.value);
  formdata.append("name", nameInput.value);
  formdata.append("releaseDate", releaseDateInput.value);
  formdata.append("trailerurl", trailerInput.value);
  formdata.append("language", languageInput.value);
  formdata.append("ageLimit", ageLimitInput.value);

  for (let ctgItem of ctgItems) {
    if (ctgItem.checked) {
      formdata.append("categoryIds", ctgItem.value);
    } 
  }

  if (modalFlag) {
    formdata.append("movieId", movies[globalMoviesIndex].id);
  }
  
  const requestOptions = {
    method: modalFlag == 0 ? "POST" : "PUT",
    body: formdata,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${protocol}//${host}/api/movie`, requestOptions);
    const data = await response.json();

    if (data.status != 200 && data.status != 201) {
      throw data;
    }

    movies[globalMoviesIndex] = data.data;

    Swal.fire({
      title: locale == 'vi' ? 'Thành công' : 'Success',
      text: `Cập nhật phim ${movies[globalMoviesIndex].name} thành công`,
      icon: 'success',
    });
    bindingMovieInModal(globalMoviesIndex);
    turnOffInvalidInputFeedback();
  } catch (error) {
    console.log(error);
    if (!error.errors) return;

    for (let key of Object.keys(error.errors)) {
      const inputElement = document.querySelector(`#${key}`);
      const invalidFeedbackElement = inputElement.nextElementSibling;

      console.log(invalidFeedbackElement);

      inputElement.classList.add('is-invalid');
      invalidFeedbackElement.classList.remove('d-none');
      invalidFeedbackElement.innerText = error.errors[key];
    }
  }
}
