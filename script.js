VIDEO_LINKS = [];
SWIPE_THRESHOLD = 3;  // How many swipes allowed per second
SWIPES = 0;  // How many swipes have been made

function beginExperiment() {
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
	playVideo(0);
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

function renderVideos(videoLinks) {
	// <div class="content" style="transform: translateY(0px);"><iframe width="220" height="406" src="https://www.youtube.com/embed/9lQFQxvDnOc?enablejsapi=1&amp;loop=1&amp;playlist=9lQFQxvDnOc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe></div>

	let videosContainer = document.getElementById("container");
	for (let i = 0; i < videoLinks.length; i++) {
		let videoLink = videoLinks[i];
		let newLink = convertLink(videoLink);
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
}

document.addEventListener('DOMContentLoaded', (event) => {
	function swipeTo(index) {
		// guard against out of bounds index
		if (index < 0 || index > maxIndex) return;

		currentContentIndex = index;
		const offset = -index * window.innerHeight;
		contents.forEach((content) => {
				content.style.transform = `translateY(${offset}px)`;
		});

		SWIPES += 1;
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
					stopVideo(currentContentIndex);
					swipeTo(currentContentIndex + 1);
					playVideo(currentContentIndex);  // play new video which is now at updated index?
			} else if (endY - startY > 50) {
					// Swipe Down
					console.log("attempt swipe down from " + currentContentIndex + " to " + (currentContentIndex - 1));
					stopVideo(currentContentIndex);
					swipeTo(currentContentIndex - 1);
					playVideo(currentContentIndex);  // play new video which is now at updated index?
			}
	});
});
