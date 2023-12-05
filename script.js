START_TIME = 0;
VIDEO_LINKS = [];
SWIPE_THRESHOLD = 3;  // How many swipes allowed per second
SWIPES = 0;  // How many swipes have been made

function canSwipe() {
	let currentTime = new Date().getTime();
	let elapsedTime = (currentTime - START_TIME) / 1000;
	console.log(elapsedTime)
	let swipesPerSecond = SWIPES / elapsedTime;
	console.log("swipes per second: " + swipesPerSecond);

	if (swipesPerSecond > (SWIPE_THRESHOLD * 1000)) {
		console.log("too many swipes");
		return false;
	}

	return true;
}

function beginExperiment() {
	START_TIME = new Date().getTime();

	// Hide the start button
	let startButton = document.getElementById("startContainer");
	startButton.style.display = "none";

	// let stopButton = document.getElementById("stopButton");
	// stopButton.style.display = "block";

	// Show the videos
	let videosContainer = document.getElementById("container");
	videosContainer.style.display = "block";

	// Render the videos
	// renderVideos(videoLinks);

	// Play the first video
	// playVideo(0);

	// basically, videos aren't allowed to autoplay with sound if there is no explicit action from	the user
	// swiping is not considered an explicit action
	// The only explicit action we have is clicking the start button at the beginning.
	// Therefore, when the user presses the start button, we need to "pre-play" all the videos
	// so that they are ready to play when we swipe to them.
	// The videos not on the page are paused, but with autoplay and sound activated
	// When we do swipe to them, playVideo() is called and they are allowed to autoplay with sound
	var iframes = document.querySelectorAll('iframe');
	for (let i = 0; i < iframes.length; i++) {
		var iframe = iframes[i];
		iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
	}
}

function stopExperiment() {
	// Hide the videos
	let videosContainer = document.getElementById("container");
	videosContainer.style.display = "none";

	// Show the start button
	// let startButton = document.getElementById("startContainer");
	// startButton.style.display = "block";

	// Stop the videos
	for (let i = 0; i < VIDEO_LINKS.length; i++) {
		stopVideo(i);
	}

	console.log("swipes: " + SWIPES);
}

function renderVideos(videoLinks, isProcessed=false) {
	// <div class="content" style="transform: translateY(0px);"><iframe width="220" height="406" src="https://www.youtube.com/embed/9lQFQxvDnOc?enablejsapi=1&amp;loop=1&amp;playlist=9lQFQxvDnOc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe></div>

	let videosContainer = document.getElementById("container");
	for (let i = 0; i < videoLinks.length; i++) {
		let videoLink = videoLinks[i];
		let newLink = isProcessed ? videoLink : convertLink(videoLink);
		let newVideo = document.createElement("iframe");
		newVideo.setAttribute("width", 220);
		newVideo.setAttribute("height", 406);
		newVideo.setAttribute("src", newLink);
		newVideo.setAttribute("frameborder", "0");
		newVideo.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
		newVideo.setAttribute("allowfullscreen", "");

		// Add stop button
		var stopButton = document.createElement('div');
    stopButton.id = 'stopButton';
    stopButton.innerHTML = 'X';
    stopButton.onclick = stopExperiment;

    // Contain iframe and button inside div
		let div = document.createElement("div");
		div.setAttribute("class", "content");
		div.appendChild(stopButton);
		div.appendChild(newVideo);

		videosContainer.appendChild(div);
	}
}

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

function playVideo(index) {
	var iframes = document.querySelectorAll('iframe');

	var iframe = iframes[index];
	if (iframe)
		iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
		iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');

		// setTimeout(function() {
		//
		// }, 1000);
}

document.addEventListener('DOMContentLoaded', (event) => {
	function swipeTo(index) {
		// guard against out of bounds index
		if (index < 0 || index > maxIndex);

		currentContentIndex = index;
		const offset = -index * window.innerHeight;
		contents.forEach((content) => {
				content.style.transform = `translateY(${offset}px)`;
		});
	}

	const container = document.getElementById('container');
	let currentContentIndex = 0;
	const contents = document.querySelectorAll('.content');
	const maxIndex = contents.length - 1;

	// Basic swipe detection
	let startY;
	container.addEventListener('touchstart', (e) => {
			startY = e.touches[0].clientY;
	});

	container.addEventListener('touchend', (e) => {
			if (!startY) return;

			let endY = e.changedTouches[0].clientY;
			// swipe means 50px difference in beginning of drag and end of drag
			if (startY - endY > 50) {
				// Swipe Up
				console.log("attempt swipe up from " + currentContentIndex + " to " + (currentContentIndex + 1));

				SWIPES += 1;
				if (canSwipe()) {
					stopVideo(currentContentIndex);
					swipeTo(currentContentIndex + 1);
					playVideo(currentContentIndex);  // play new video which is now at updated index?
				}
			} else if (endY - startY > 50) {
				// Swipe Down
				SWIPES += 1;
				console.log("attempt swipe down from " + currentContentIndex + " to " + (currentContentIndex - 1));

				if (canSwipe()) {
					stopVideo(currentContentIndex);
					swipeTo(currentContentIndex - 1);
					playVideo(currentContentIndex);  // play new video which is now at updated index?
				}
			}
	});
});
