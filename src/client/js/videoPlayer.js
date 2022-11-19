const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumn = document.getElementById("volumn");
const volumeRange = document.getElementById("volume");

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
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
const handleLoadedMetadata = () => {
  //duration 속성은 video의 총 시간을 초단위로 가져온다.
  totalTime.innerText = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = Math.floor(video.currentTime);
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
// meta data가 로드될 때 실행된다. 여기서 meta data는 비디오를 제외한 정보를 말한다.
// 비디오의 크기, 비디오의 길이
// 즉, 비디오에서 움직이는 이미지들을 제외한 모든 엑스트라 정보들을 말한다.
video.addEventListener("loadedmetadata", handleLoadedMetadata);
// 시간이 업데이트 될때마다 실행되는 이벤트
video.addEventListener("timeupdate", handleTimeUpdate);
