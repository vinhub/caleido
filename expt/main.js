const constraints = { video: true };
const takePictureBtn = document.querySelector('#take-picture-button');
const savePictureBtn = document.querySelector('#save-picture-button');
const pictureImg = document.querySelector('#picture-img');
const video1 = document.querySelector('#video-1');
const video2 = document.querySelector('#video-2');

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const videoContainer = document.querySelector('#video-container');
if (windowWidth > windowHeight) {
  // horizontal
  videoContainer.style.flexDirection = 'row';
  video1.style.width = video2.style.width = videoContainer.clientWidth / 2;
  video1.style.height = video2.style.height = videoContainer.clientHeight;
} else {
  // vertical
  videoContainer.style.flexDirection = 'column'; 
  video1.style.width = video2.style.width = videoContainer.clientWidth;
  video1.style.height = video2.style.height = videoContainer.clientHeight / 2;
}

takePictureBtn.onclick = video1.onclick = video2.onclick = function() {
  const canvas1 = document.createElement('canvas');

  canvas1.width = pictureImg.style.width = video1.videoWidth * 2;
  canvas1.height = pictureImg.style.height = video1.videoHeight;

  const context = canvas1.getContext('2d');
  context.drawImage(video1, 0, 0);
  
  const canvas2 = transformVideo(video1);
  context.drawImage(canvas2, video1.videoWidth, 0);
  canvas2.remove();
  
  // Other browsers will fall back to image/png
  pictureImg.src = canvas1.toDataURL('image/webp');
  canvas1.remove();
  
  pictureImg.style.display = 'block';
  videoContainer.style.display = 'none';
  savePictureBtn.disabled = false;
  takePictureBtn.disabled = true;
};

savePictureBtn.onclick = function() {
  // Save picture
  savePictureBtn.href = pictureImg.src.replace('image/png', 'image/octet-stream');
  savePictureBtn.download = 'caleido-' + Math.random().toString(36).substring(7) + '.png';
          
  pictureImg.style.display = 'none';
  videoContainer.style.display = 'flex';
  savePictureBtn.disabled = true;
  takePictureBtn.disabled = false;
};

function transformVideo(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video1.videoWidth * 2;
  canvas.height = video1.videoHeight;
  context = canvas.getContext('2d');
  context.translate(video.videoWidth, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0);
  return canvas;
}

function handleSuccess(stream) {
  takePictureBtn.disabled = false;
  video1.srcObject = stream;
  video2.srcObject = stream;
}

function handleError(error) {
  console.error('navigator.getUserMedia error: ', error);
}

(function() {
  navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
})();
