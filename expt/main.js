'use strict';

const constraints = { video: true };
const videoContainer = document.querySelector('#video-container');
const video1 = document.querySelector('#video-1');
const video2 = document.querySelector('#video-2');
let takePictureBtn = document.querySelector('#take-picture-button');
let savePictureBtn = document.querySelector('#save-picture-button');
const pictureImg = document.querySelector('#picture-img');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

takePictureBtn.onclick = function() {
  if (takePictureBtn.tagName.toLowerCase() === 'span')
    return;
  
  // const orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;
  //const isLandscape = orientation.startsWith('landscape-');
  const isLandscape = (typeof window.orientation !== 'undefined') ? (Math.abs(window.orientation) === 90) : true;

  const canvas1 = document.createElement('canvas');

  canvas1.width = pictureImg.style.width = isLandscape ? (video1.videoWidth * 2) : video1.videoWidth;
  canvas1.height = pictureImg.style.height = isLandscape ? video1.videoHeight : (video1.videoHeight * 2);

  const context = canvas1.getContext('2d');
  context.drawImage(video1, 0, 0);
  
  const canvas2 = transformVideo(video1, isLandscape);
  context.drawImage(canvas2, isLandscape ? video1.videoWidth : 0, isLandscape ? 0 : video1.videoHeight);
  canvas2.remove();
  
  pictureImg.src = canvas1.toDataURL('image/png');
  canvas1.remove();
  
  pictureImg.style.display = 'block';
  videoContainer.style.display = 'none';
  takePictureBtn = enableDisableButton(takePictureBtn, false);
  savePictureBtn = enableDisableButton(savePictureBtn, true);
};

// Save picture
savePictureBtn.onclick = function() {
  if (savePictureBtn.tagName.toLowerCase() === 'span')
    return;
  
  if (isIOS) {
    alert('To save the picture, please tap the picture and hold. It will bring up the "Save Image" menu that will let you save the picture.');
  } else {
    savePictureBtn.href = pictureImg.src.replace('image/png', 'image/octet-stream');
    savePictureBtn.download = 'caleido-' + Math.random().toString(36).substring(7) + '.png';
  }
          
  pictureImg.style.display = 'none';
  videoContainer.style.display = 'block';
  takePictureBtn = enableDisableButton(takePictureBtn, true);
  savePictureBtn = enableDisableButton(savePictureBtn, false);
};

function transformVideo(video, isLandscape) {
  const canvas = document.createElement('canvas');
  canvas.width = isLandscape ? video.videoWidth * 2 : video.videoWidth;
  canvas.height = isLandscape ? video.videoHeight : video.videoHeight * 2;
  const context = canvas.getContext('2d');
  context.translate(isLandscape ? video.videoWidth : 0, isLandscape ? 0 : video.videoHeight);
  context.scale(isLandscape ? -1 : 1, isLandscape ? 1 : -1);
  context.drawImage(video, 0, 0);
  return canvas;
}

function enableDisableButton(el, fEnable) {
  const elNew = document.createElement(fEnable ? 'a' : 'span');
  elNew.innerHTML = el.innerHTML;
  const id = el.id;
  elNew.className = el.className;
  elNew.href = '#';
  elNew.onclick = el.onclick;
  
  el.parentNode.appendChild(elNew);
  el.parentNode.removeChild(el);
  elNew.id = id;
  
  return elNew;
}

function handleSuccess(stream) {
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
