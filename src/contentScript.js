'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

class VideoColorSampler {
  constructor(video, canvasSize = 300) {
    if (!video) {
      throw new Error("Invalid video element.");
    }

    this.video = video;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize * (this.video.videoHeight / this.video.videoWidth);
    this.latestImageData = null;
    this.isProcessing = false;
    this.processQueue = [];
    this.updateLatestImageData();
  }

  getBlurredImage(radius = 10) {
    const blurredCanvas = document.createElement('canvas');
    const blurredCtx = blurredCanvas.getContext('2d');
    blurredCanvas.width = this.canvas.width;
    blurredCanvas.height = this.canvas.height;

    if (this.latestImageData) {
      blurredCtx.putImageData(this.latestImageData, 0, 0);
      blurredCtx.filter = `blur(${radius}px)`;
      blurredCtx.drawImage(blurredCanvas, 0, 0, this.canvas.width, this.canvas.height);
      return blurredCanvas;
    } else {
      console.error('Error getting blurred image: latestImageData is null');
      return null;
    }
  }

  setBlurredBackground(node, radius = 10) {
    const blurredImage = this.getBlurredImage(radius);
    if (blurredImage) {
      node.style.background = `url(${blurredImage.toDataURL()})`;
      node.style.backgroundSize = 'cover';
      node.style.transform = 'scale(1.01)';
      node.style.overflow = 'hidden';
    } else {
      console.error('Error setting blurred background: blurredImage is null');
    }
  }

  updateLatestImageData() {
    if (!this.isProcessing) {
      this.isProcessing = true;
      requestAnimationFrame(() => {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.latestImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.isProcessing = false;
        this.processQueue.forEach(callback => callback(this.latestImageData));
        this.processQueue = [];
        this.updateLatestImageData();
      });
    } else {
      this.processQueue.push(callback);
    }
  }
}






setTimeout(() => {
  document.querySelector('#secondary').style.display = 'none';
  document.querySelector('#below').style.display = 'none';

  let video = document.querySelector('video');
  let ytApp = document.querySelector('ytd-app');
  let videoColorSampler = new VideoColorSampler(video,200);

  function updateBackground() {
    videoColorSampler.setBlurredBackground(ytApp,5);
    requestAnimationFrame(updateBackground);
  }
  
  requestAnimationFrame(updateBackground,5);

}, 10000);
