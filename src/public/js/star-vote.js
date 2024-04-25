function makeStarActiveAndInActive(index) {
  for (let i = 0; i <= index; i++) {
    const starIcon = starRadios[i].nextElementSibling.firstElementChild;
    starIcon.classList.remove('star-inactive');
    starIcon.classList.add('star-active');
  }
  for (let i = index + 1; i < starRadios.length; i++) {
    const starIcon = starRadios[i].nextElementSibling.firstElementChild;
    starIcon.classList.add('star-inactive');
    starIcon.classList.remove('star-active');
  }
}

function starVote(name) {
  const starRadios = document.querySelectorAll(`input[name=${name}]`);
  function makeStarActiveAndInActive(index) {
    for (let i = 0; i <= index; i++) {
      const starIcon = starRadios[i].nextElementSibling.firstElementChild;
      starIcon.classList.remove('star-inactive');
      starIcon.classList.add('star-active');
    }
    for (let i = index + 1; i < starRadios.length; i++) {
      const starIcon = starRadios[i].nextElementSibling.firstElementChild;
      starIcon.classList.add('star-inactive');
      starIcon.classList.remove('star-active');
    }
  }

  starRadios.forEach((item, index) => {
    item.addEventListener('click', () => {
      makeStarActiveAndInActive(index);
    });
  });

  return starRadios;
}

var starRadios = starVote('star');
