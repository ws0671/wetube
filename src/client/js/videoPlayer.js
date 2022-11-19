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
const formatTime = (seconds) =>
  // new Date()에 숫자를 넣으면 1970년 부터 얼마만큼의 밀리초가 지났는지 결과로 나온다.
  // 출력해보면 한국 표준시로 9시부터 + 인자로 넣은 밀리초 만큼 지난 값이 출력된다.
  // 그래서 new.Date(x).toISOString()을 해주면 0시부터 + 인자 만큼 지난 값이 출력된다.
  // 이러한 성질을 이용해 숫자 포맷을 가져올 수 있다.
  new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
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
