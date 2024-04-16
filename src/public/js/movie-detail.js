const trailer = document.querySelector('.iframe-wapper div');
const btnToggleTrailer = document.querySelector('.btn-toggle-trailer');
const closeVideoModal = document.querySelector('.close-video-modal');

let player;
const prefix = 'https://www.youtube.com/embed';

function onYouTubeIframeAPIReady() {
  const videoId = trailer.nextElementSibling.src.substring(prefix.length);
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  closeVideoModal.addEventListener('click', () => {
    player.stopVideo();
  });
}

trailer.onclick = () => {
  player.playVideo();
  btnToggleTrailer.click();
}
