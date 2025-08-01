const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");
const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const downloadImgBtn = lightbox.querySelector(".uil-import");
const closeImgBtn = lightbox.querySelector(".close-icon");
const filetype = document.getElementById('filetype');

// API key, paginations, searchTerm variables
const apiKey = "1MhZfTY8DQp3Mo8skmbXJFhuAHY2Ek6IkFv5sTDpwURaQ1fYKvvOlqMg";
const perPage = 15;
let currentPage = 1;
let searchTerm = null;

const downloadImg = (imgUrl) => {
    // Converting received img to blob, creating its download link, & downloading it
    fetch(imgUrl).then(res => res.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = new Date().getTime();
        a.click();
    }).catch(() => alert("Failed to download image!"));
}

const downloadMedia = (e) => {
    const mediaUrl = e.target.getAttribute("data-media");
    const mediaType = e.target.getAttribute("data-type");
    
    if (mediaType === "image") {
        downloadImg(mediaUrl);
    } else if (mediaType === "video") {
        downloadVideo(mediaUrl);
    }
}

const downloadVideo = (videoUrl) => {
    // Converting received video to blob, creating its download link, & downloading it
    fetch(videoUrl).then(res => res.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `video_${new Date().getTime()}.mp4`; // You can adjust the filename and extension as needed
        a.click();
    }).catch(() => alert("Failed to download video!"));
}

const showLightbox = (name, media, isVideo = false) => {
    // Showing lightbox and setting img/video source, name, and button attribute
    if (isVideo) {
        lightbox.querySelector(".img").innerHTML = `<video controls autoplay><source src="${media}" type="video/mp4">Your browser does not support the video tag.</video>`;
        downloadImgBtn.setAttribute("data-media", media);
        downloadImgBtn.setAttribute("data-type", "video");
    } else {
        lightbox.querySelector(".img").innerHTML = `<img src="${media}" alt="preview-img"></img>`;
        downloadImgBtn.setAttribute("data-media", media);
        downloadImgBtn.setAttribute("data-type", "image");
    }
    lightbox.querySelector("span").innerText = name;
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}


const hideLightbox = () => {
    // Hiding lightbox on close icon click
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
    lightbox.querySelector(".img").innerHTML="";
}

const generateHTML = (images) => {
    // Making li of all fetched images and adding them to the existing image wrapper
    imageWrapper.innerHTML += images.map(img =>
        `<li class="card">
            <img onclick="showLightbox('${img.photographer}', '${img.src.large2x}',false)" src="${img.src.large2x}" alt="img">
            <div class="details">
                <div class="photographer">
                    <i class="uil uil-camera"></i>
                    <span>${img.photographer}</span>
                </div>
                <button onclick="downloadImg('${img.src.large2x}');">
                    <i class="uil uil-import"></i>
                </button>
            </div>
        </li>`
    ).join("");
}

const generateVideoHTML = (videos) => {
    // Making li of all fetched videos and adding them to the existing image wrapper
    imageWrapper.innerHTML += videos.map(video =>
        `<li class="card">
            <video loop muted class="hover-video" onclick="showLightbox('${video.user.name}', '${video.video_files[0].link}', true)">
                <source src="${video.video_files[0].link}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </li>`
    ).join("");

    // Adding hover play/pause functionality to the newly added videos
    const videoElements = document.querySelectorAll('.hover-video');
    videoElements.forEach(video => {
        video.addEventListener('mouseenter', () => {
            video.play();
        });
        video.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // Reset video to start
        });
    });
}

const getImages = (apiURL) => {
    // Fetching images by API call with authorization header
    if (currentPage == 1)
        loadMoreBtn.style.visibility = 'visible';
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.classList.add("disabled");
    fetch(apiURL, {
        headers: { Authorization: apiKey }
    }).then(res => res.json()).then(data => {
        generateHTML(data.photos);
        document.getElementById("resultfound").innerHTML = `${data.total_results}`;
        if (!data.next_page) {
            loadMoreBtn.style.visibility = 'hidden';
        } else {
            loadMoreBtn.innerText = "Load More";
            loadMoreBtn.classList.remove("disabled");
        }
    }).catch(() => alert("Failed to load images!"));
}

const getVideos = (apiURL) => {
    // Fetching videos by API call with authorization header
    if (currentPage == 1)
        loadMoreBtn.style.visibility = 'visible';
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.classList.add("disabled");
    fetch(apiURL, {
        headers: { Authorization: apiKey }
    }).then(res => res.json()).then(data => {
        generateVideoHTML(data.videos);
        document.getElementById("resultfound").innerHTML = `${data.total_results}`;
        if (!data.next_page) {
            loadMoreBtn.style.visibility = 'hidden';
        } else {
            loadMoreBtn.innerText = "Load More";
            loadMoreBtn.classList.remove("disabled");
        }
    }).catch(() => alert("Failed to load videos!"));
}

const loadMoreResult = (e) => {
    currentPage++; // Increment currentPage by 1
    // If searchTerm has some value then call API with search term else call default API
    if (filetype.value === 'Picture') {
        let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
        apiUrl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}` : apiUrl;
        getImages(apiUrl);
    } else {
        let apiUrl = `https://api.pexels.com/videos/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`;
        getVideos(apiUrl);
    }
}

const loadSearchResult = (e) => {
    // If the search input is empty, set the search term to null and return from here
    if (e.target.value === "") return searchTerm = null;
    // If pressed key is Enter, update the current page, search term & call the getImages or getVideos
    if (e.key === "Enter") {
        currentPage = 1;
        searchTerm = e.target.value;
        imageWrapper.innerHTML = "";
        if (filetype.value === 'Picture') {
            getImages(`https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`);
        } else {
            getVideos(`https://api.pexels.com/videos/search?query=${searchTerm}&page=1&per_page=${perPage}`);
        }
    }
}

getImages(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`);
loadMoreBtn.addEventListener("click", loadMoreResult);
searchInput.addEventListener("keyup", loadSearchResult);
closeImgBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", downloadMedia);
