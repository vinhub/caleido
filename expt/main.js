'use strict';

const videoContainer = document.querySelector('#video-container');
const video1 = document.querySelector('#video-1');
const video2 = document.querySelector('#video-2');
const homeBtn = document.querySelector('#home-button');
let switchCameraBtn = document.querySelector('#switch-camera-button');
let takePictureBtn = document.querySelector('#take-picture-button');
let savePictureBtn = document.querySelector('#save-picture-button');
let selectEffectBtn = document.querySelector('#select-effect-button');
const selectEffectDiv = document.querySelector('#select-effect-div');
const selectEffect = document.querySelector('#select-effect');
const pictureImg = document.querySelector('#picture-img');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

let cameraDeviceIds = [];
let currentCameraIndex = -1;
let selectedEffect = 'Normal';

homeBtn.onclick = () => {
  // hide popup
  selectEffectDiv.style.display = 'none';
  
  if (videoContainer.style.display === 'block') // already home?
    return;
  
  pictureImg.style.display = 'none';
  videoContainer.style.display = 'block';
  
  switchCameraBtn = enableDisableButton(switchCameraBtn, cameraDeviceIds.length > 1);
  takePictureBtn = enableDisableButton(takePictureBtn, true);
  savePictureBtn = enableDisableButton(savePictureBtn, false);
  selectEffectBtn = enableDisableButton(selectEffectBtn, true);

  refreshDeviceIds();
}

switchCameraBtn.onclick = () => {
  // hide popup
  selectEffectDiv.style.display = 'none';
  
  if (switchCameraBtn.tagName.toLowerCase() === 'span')
    return;
  
  switchCamera();
}

takePictureBtn.onclick = () => {
  // hide popup
  selectEffectDiv.style.display = 'none';
  
  if (takePictureBtn.tagName.toLowerCase() === 'span')
    return;
  
  // const orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;
  //const isLandscape = orientation.startsWith('landscape-');
  const isLandscape = (typeof window.orientation !== 'undefined') ? (Math.abs(window.orientation) === 90) : true;

  const canvas1 = document.createElement('canvas');

  const oSize = getOriginalClippedSize(video1.videoWidth, video1.videoHeight, video1.clientWidth, video1.clientHeight);
  canvas1.width = pictureImg.style.width = isLandscape ? (video1.clientWidth * 2) : video1.clientWidth;
  canvas1.height = pictureImg.style.height = isLandscape ? video1.clientHeight : (video1.clientHeight * 2);

  const context = canvas1.getContext('2d');
  context.drawImage(video1, 0, 0, oSize.width, oSize.height, 0, 0, video1.clientWidth, video1.clientHeight);
  
  const canvas2 = transformVideo(video1, oSize, isLandscape);
  context.drawImage(canvas2, isLandscape ? video1.clientWidth : 0, isLandscape ? 0 : video1.clientHeight);
  canvas2.remove();
  
  pictureImg.src = canvas1.toDataURL('image/png');
  canvas1.remove();
  
  pictureImg.style.display = 'block';
  videoContainer.style.display = 'none';
  takePictureBtn = enableDisableButton(takePictureBtn, false);
  savePictureBtn = enableDisableButton(savePictureBtn, true);
  switchCameraBtn = enableDisableButton(switchCameraBtn, false);
  selectEffectBtn = enableDisableButton(selectEffectBtn, false);
};

// Save picture
savePictureBtn.onclick = () => {
  // hide popup
  selectEffectDiv.style.display = 'none';
  
  if (savePictureBtn.tagName.toLowerCase() === 'span')
    return;
  
  if (isIOS) {
    alert('To save the picture, tap and hold on it to bring up the iOS \'Save Image\' menu.');
    return;
  } else {
    savePictureBtn.href = pictureImg.src.replace('image/png', 'image/octet-stream');
    savePictureBtn.download = 'caleido-' + Math.random().toString(36).substring(7) + '.png';
  }
};

// select effect
selectEffectBtn.onclick = () => {
  if (selectEffectBtn.tagName.toLowerCase() === 'span')
    return;
  
  if (selectEffectDiv.style.display === 'block') {
    selectEffectDiv.style.display = 'none';
  } else {
    selectEffectDiv.style.display = 'block';
  }
}

selectEffect.onchange = () => {
  selectedEffect = selectEffect.options[selectEffect.selectedIndex].value;
  selectEffectDiv.style.display = 'none';
  
  applyEffect();
}

function applyEffect() {
  switch (selectedEffect) {
    case 'Satura':
      video1.style.filter = 'saturate(1000%)';
      video2.style.filter = 'saturate(1000%) invert(100%)';
      break;
      
    case 'Invertoo':
      video1.style.filter = 'invert(100%)';
      video2.style.filter = 'invert(70%)';
      break;
      
    case 'Edgy':
      video1.style.filter = 'url(#EdgeDetect)';
      video2.style.filter = 'url(#EdgeDetect) invert(70%)';
      break;
      
    case 'Cool':
      video1.style.filter = 'invert(100%) saturate(1000%)';
      video2.style.filter = 'invert(100%)';
      break;
      
    default:
      video1.style.filter = null;
      video2.style.filter = null;
      break;
  }
}

function transformVideo(video, oSize, isLandscape) {
  const canvas = document.createElement('canvas');
  canvas.width = isLandscape ? video.clientWidth * 2 : video.clientWidth;
  canvas.height = isLandscape ? video.clientHeight : video.clientHeight * 2;
  const context = canvas.getContext('2d');
  context.translate(isLandscape ? video.clientWidth : 0, isLandscape ? 0 : video.clientHeight);
  context.scale(isLandscape ? -1 : 1, isLandscape ? 1 : -1);
  context.drawImage(video, 0, 0, oSize.width, oSize.height, 0, 0, video.clientWidth, video.clientHeight);
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

function getOriginalClippedSize(oWidth, oHeight, cWidth, cHeight) {
  const oRatio = oWidth / oHeight;
  const cRatio = cWidth / cHeight;
  return function() {
    if (oRatio < cRatio) {
      this.width = oWidth;
      this.height = oWidth / cRatio;
    } else {
      this.width = oHeight * cRatio;
      this.height = oHeight;
    }      
    return this;
  }.call({});
}

function handleSuccess(stream) {
  video1.srcObject = stream;
  video2.srcObject = stream;

  applyEffect();
  refreshDeviceIds();
}

function handleError(error) {
  console.error('navigator.getUserMedia error: ', error);
  alert('navigator.getUserMedia error: ' + error.name + ", " + error.message + ", " + error.constraint);
}

function switchCamera() {
  if (cameraDeviceIds.length <= 0)
    return;
  if ((currentCameraIndex === 0) && (cameraDeviceIds.length === 1))
    return;
  
  currentCameraIndex = (currentCameraIndex < 0) ? 0 : ((currentCameraIndex + 1) % cameraDeviceIds.length);
  const constraints = {
    video: { width: 640, deviceId: { exact: cameraDeviceIds[currentCameraIndex] } },
    audio: false
  };
    
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
}

function refreshDeviceIds() {
  cameraDeviceIds = [];
  navigator.mediaDevices.enumerateDevices().then(mediaDevices => { 
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        cameraDeviceIds.push(mediaDevice.deviceId);
      }
    });
    
    if (currentCameraIndex < 0)
      switchCamera();  
    
    switchCameraBtn = enableDisableButton(switchCameraBtn, cameraDeviceIds.length > 1);
  });
}

(function() {
  refreshDeviceIds();
})();
