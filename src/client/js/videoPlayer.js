const { async } = require("regenerator-runtime");
import message from "./components/message";

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn?.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn?.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumn = document.getElementById("volumn");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn?.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const deleteBtn = document.querySelector(".delete");
const deleteModal = document.querySelector(".delete-modal");
const cancleBtn = document.querySelector(".button--grey");
const commentInput = document.getElementById("comment-input");
const middleAnimationSpan = document.querySelector(".middle-animation-icon");
const middleAnimationIcon = middleAnimationSpan?.querySelector("i");
const menuIcon = document.querySelector(".menu-icon");
const menuIconOption = document.querySelector(".menu-icon__option");
const subscribeBtn = document.querySelector(".subscribe-btn");
const numberOfSubscribes = document.querySelector(".video__owner-reader");
let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
if (video) video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  // muteBtn을 눌러서 muted가 true이면 그 상태에서 volume을 조절해도 계속 true
  // 따라서 muted가 true일때 volume을 조절하면 muted가 false가 되고
  // muted가 아닌 상태가 되기 때문에, muteBtn에 "Mute" 글자를 넣어준다.
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};
const formatTime = (seconds) =>
  // new Date()에 숫자를 넣으면 1970년 부터 얼마만큼의 밀리초가 지났는지 결과로 나온다.
  // 출력해보면 한국 표준시로 9시부터 + 인자로 넣은 밀리초 만큼 지난 값이 출력된다.
  // 그래서 new.Date(x).toISOString()을 해주면 0시부터 + 인자 만큼 지난 값이 출력된다.
  // 이러한 성질을 이용해 숫자 포맷을 가져올 수 있다.
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};
const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  // document.fullscreenElement는 코드를 실행하면 fullscreen이 일어난 태그를 반환한다.
  // fullscreen이 없는경우 null을 반환한다.
  const fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};
const hideControls = () => videoControls.classList.remove("showing");
const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(() => {
    hideControls;
  }, 3000);
};

const handleKey = (event) => {
  // 댓글쓸때 keydown 이벤트 해제하기
  if (event.target?.id === commentInput?.id) return;
  if (event.code === "Space") {
    event.preventDefault();
    middleAnimationSpan.classList.remove("showing");
    void middleAnimationSpan.offsetWidth;
    middleAnimationSpan.classList.add("showing");
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  } else if (event.code === "KeyF") {
    const fullScreen = document.fullscreenElement;
    if (fullScreen) {
      document.exitFullscreen();
      fullScreenIcon.classList = "fas fa-expand";
    } else {
      videoContainer.requestFullscreen();
      fullScreenIcon.classList = "fas fa-compress";
    }
  }

  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  middleAnimationIcon.classList = video.paused
    ? "fa-solid fa-circle-pause"
    : "fa-solid fa-circle-play";
};

const handleVideoClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }

  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  middleAnimationIcon.classList = video.paused
    ? "fa-solid fa-circle-pause"
    : "fa-solid fa-circle-play";
};

// 프론트엔드에서 백엔드로 요청 보내기
// id는 태그에 담긴 dataset을 불러온다.
const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleModal = (e) => {
  deleteModal.classList.remove("hide");
};

const render = (subscribes, subscribers) => {
  let renderHTML = "";

  const subscribeUl = document.querySelector(".subscribe ul");
  numberOfSubscribes.innerText = `구독자 ${subscribers.length}명`;
  if (subscribes.length) {
    subscribes.forEach((subscribe) => {
      renderHTML += `<li><a href='/users/${subscribe._id}'>
      <img class='subscribe__avatar' src='${subscribe.avatarUrl}'/>
      <div>${subscribe.name}</div></a></li>`;
      subscribeUl.innerHTML = renderHTML;
    });
  } else {
    subscribeUl.innerHTML = "";
  }
};

const handleSubscribe = async (e) => {
  const { id } = e.target.dataset;
  if (!id) {
    message("error", "Log in First");
  }

  const response = await fetch(`/users/${id}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 200) {
    subscribeBtn.innerText = "구독중";
    subscribeBtn.classList.add("reading");
    const { userSubscribes, ownerSubscribers } = await response.json();
    render(userSubscribes, ownerSubscribers);
  }
  if (response.status === 202) {
    subscribeBtn.innerText = "구독";
    subscribeBtn.classList.remove("reading");
    const { userSubscribes, ownerSubscribers } = await response.json();
    render(userSubscribes, ownerSubscribers);
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.readyState
  ? handleLoadedMetadata()
  : video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
// ended 이벤트는 HtmlMediaElement의 이벤트로써 여기서는 video가 재생완료 된 시점에 발생한다.
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
window.addEventListener("keydown", handleKey);
video.addEventListener("click", handleVideoClick);
menuIcon?.addEventListener("click", () => {
  menuIconOption.classList.toggle("hide");
});
if (subscribeBtn) {
  subscribeBtn.addEventListener("click", handleSubscribe);
}
// Modal event
deleteBtn?.addEventListener("click", handleModal);
cancleBtn.addEventListener("click", () => {
  deleteModal.classList.add("hide");
});
