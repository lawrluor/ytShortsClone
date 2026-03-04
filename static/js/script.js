START_TIME = 0;  // replaced later when we call beginExperiment(): calls Date().getTime()
SWIPE_THRESHOLD = 0.25;  // swipes allowed per second
SWIPES = 0;  // how many swipes have been made
let csvData = "videoNumber,time\n";

function isProbablyMobileBrowser() {
  // prefer UA-CH when available, but not supported in all browsers
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    return navigator.userAgentData.mobile;
  }

  // check for standard mobile user agent strings (iOS, Android, etc.)
  const ua = navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  if (isMobileUA) return true;

  // use media query to check for coarse pointer (touch screen)
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
    return true;
  }

  return false;
}

// update the desktop warning based on whether the user is on a mobile browser
function updateDesktopWarning() {
  const warning = document.getElementById('desktopWarning');
  const startButton = document.getElementById('startButton');

  if (!warning) return;

  if (isProbablyMobileBrowser()) {
    warning.style.display = 'none';
    startButton.style.display = 'block';
  } else {
    warning.style.display = 'block';
    startButton.style.display = 'none';
  }
}

function addData(numOfSwipes, elapsedTime) {
  csvData += `${numOfSwipes + 1},${elapsedTime}\n`;  // one-indexed
}

function downloadCSV() {
  // make file name based on start time
  // convert START_TIME to date
  // format should be MM-DD-YYYY_HH-MM-SS

  let date = new Date(START_TIME);
  let hours = date.getHours() - 4;  // use Eastern standard time
  let month = date.getMonth() + 1; 	// months are 0 indexed
  let fileName = `${month}-${date.getDate()}-${date.getFullYear()}_${hours}.${date.getMinutes()}.${date.getSeconds()}.csv`;

  // check if the download attribute is supported
  var isDownloadSupported = typeof document.createElement('a').download !== 'undefined';

  if (isDownloadSupported) {
    // use the original method for browsers that support the download attribute
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvData));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  } else {
    // fallback for browsers that do not support the download attribute
    // open the data in a new tab or window
    var encodedUri = encodeURI('data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
    window.location.assign(encodedUri);
  }
}

function showToast() {
  var toast = document.getElementById("toast");

  // toggle between hide and show
  if (toast.className.includes("hide")) {
    toast.className = toast.className.replace("hide", "show");
  }

  setTimeout(function () {
    toast.className = toast.className.replace("show", "hide");
  }, 2000);
}

function beginExperiment() {
  START_TIME = new Date().getTime();

  let startButton = document.getElementById("startContainer");
  startButton.style.display = "none";

  let stopButton = document.getElementById("stopButton");
  stopButton.style.display = "block";

  let videosContainer = document.getElementById("container");
  videosContainer.style.display = "block";

  // basically, videos aren't allowed to autoplay with sound if there is no explicit action from the user
  // swiping is not considered an explicit action/consent from the user to play a video with sound
  // The only explicit action we have is clicking the start button at the beginning.

  // Therefore, when the user presses the start button, we need to "pre-play" all the videos
  // so that they are ready to play when we swipe to them.
  // The videos that are not currently on the page are paused, but with autoplay and sound activated
  // When we do swipe to them, playVideo() is called and they are allowed to autoplay with sound
  var iframes = document.querySelectorAll('iframe');
  for (let i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');

    // immediately stop videos but leave them in a preloaded state where they can autoplay unmuted
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'stopVideo' }), '*');
  }

  // replay first video to unmute it and ensure that it plays first
  playVideo(0);
}

function endExperiment() {
  // stop all videos
  var iframes = document.querySelectorAll('iframe');
  for (let i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];

    // immediately stop videos but leave them in a preloaded state where they can autoplay unmuted
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'stopVideo' }), '*');
  }

  let videosContainer = document.getElementById("container");
  videosContainer.style.display = "none";

  let endContainer = document.getElementById("endContainer");
  endContainer.style.display = "block";
}

function renderVideos(videoLinks, isProcessed = false) {
  /*
    Example: of a video div:
    <div class="content" style="transform: translateY(0px);">
      <iframe width="220" height="406" src="https://www.youtube.com/embed/9lQFQxvDnOc?enablejsapi=1&amp;loop=1&amp;playlist=9lQFQxvDnOc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
    </div>
  */

  let videosContainer = document.getElementById("container");
  for (let i = 0; i < videoLinks.length; i++) {
    let videoLink = videoLinks[i];
    let newLink = isProcessed ? videoLink : convertLink(videoLink);

    // construct iframe using JS
    let newVideo = document.createElement("iframe");
    newVideo.setAttribute("width", "100%");
    newVideo.setAttribute("height", window.innerHeight * 0.75);
    newVideo.setAttribute("src", newLink);
    newVideo.setAttribute("frameborder", "0");
    newVideo.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    newVideo.setAttribute("allowfullscreen", "");

    // construct div to hold iframe, to help with positioning
    let div = document.createElement("div");
    div.setAttribute("class", "content");
    div.appendChild(newVideo);

    // append the div that contains the iframe to the videosContainer
    videosContainer.appendChild(div);
  }
}

// helper function to convert a youtube link into a working iframe link
function convertLink(videoLink) {
  // convert
  // "https://www.youtube.com/embed/9lQFQxvDnOc"
  // to
  // "https://www.youtube.com/embed/9lQFQxvDnOc?enablejsapi=1&loop=1&playlist=9lQFQxvDnOc"

  // split after embed/
  let id = videoLink.split("embed/")[1];

  // add query parameters
  let newLink = "https://www.youtube.com/embed/" + id + "?enablejsapi=1&loop=1&playlist=" + id;
  return newLink;
}

function stopVideo(index) {
  var iframes = document.querySelectorAll('iframe');
  var iframe = iframes[index];
  if (iframe)
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'stopVideo' }), '*');
}

// selects the video at the given iframe index and plays it.
function playVideo(index) {
  var iframes = document.querySelectorAll('iframe');
  var iframe = iframes[index];
  if (iframe)
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
  iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
}

// checks if the user is swiping too fast
function canSwipe() {
  let currentTime = new Date().getTime();
  let elapsedTime = (currentTime - START_TIME) / 1000;
  console.log("elapsed time: " + elapsedTime);
  let swipesPerSecond = SWIPES / elapsedTime;
  console.log("swipes per second: " + swipesPerSecond);

  if (swipesPerSecond > SWIPE_THRESHOLD) {
    showToast();  // show an unintrusive pop-up that says "slow down"
    return false;
  } else {
    addData(SWIPES, elapsedTime);  // add a row of data for when this swipe occurred
    return true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDesktopWarning();
  window.addEventListener('resize', updateDesktopWarning);

  const container = document.getElementById('container');
  let currentContentIndex = 0;
  const contents = document.querySelectorAll('.content');  // each div that contains an iframe
  const maxIndex = contents.length - 1;

  function swipeTo(index) {
    // guard against an index out of bounds error
    if (index < 0 || index > maxIndex)
      return;

    currentContentIndex = index;
    const offset = (-index * window.innerHeight);

    contents.forEach((content) => {
      content.style.transform = `translateY(${offset}px)`;
    });
  }

  // vid1: 0-300
  // screen height: 400
  // vid2: start at 400-700
  // vid3: start at 800-1100

  // basic swipe detection
  let startY;
  container.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  container.addEventListener('touchend', (e) => {
    if (!startY) return;

    let endY = e.changedTouches[0].clientY;
    // swipe means 50px difference in beginning of drag and end of drag
    if (startY - endY > 50) {
      console.log("attempt swipe up from " + currentContentIndex + " to " + (currentContentIndex + 1));

      if (canSwipe()) {
        stopVideo(currentContentIndex);  // stop playing the current video
        swipeTo(currentContentIndex + 1);
        playVideo(currentContentIndex);  // play new video which is now at updated index
        SWIPES += 1;
      }
    } else if (endY - startY > 50) {
      console.log("attempt swipe down from " + currentContentIndex + " to " + (currentContentIndex - 1));

      if (canSwipe()) {
        stopVideo(currentContentIndex);
        swipeTo(currentContentIndex - 1);
        playVideo(currentContentIndex);  // play new video which is now at updated index
        SWIPES += 1;
      }
    }
  });
});
