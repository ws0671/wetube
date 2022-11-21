const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  // srcObject속성은 HTMLMediaElement와 연결된 미디어의 소스 역할을 하는 객체를 설정하거나
  // 반환한다.
  video.srcObject = stream;
  video.play();
};
startBtn.addEventListener("click", handleStart);
