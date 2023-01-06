// 1. main.js에서 regenerator-runtime을 불러온다.
import regeneratorRuntime from "regenerator-runtime";
import "../scss/styles.scss";

const videoRelativeTime = document.querySelectorAll(".video-mixin-time");
// 상대 시간 계산 fn
const formatDate = (date) => {
  let diff = new Date() - new Date(date); // 차이(ms)
  if (diff < 1000) {
    // 차이가 1초 미만
    return "현재";
  }
  let sec = Math.floor(diff / 1000);
  if (sec < 60) {
    return sec + "초 전";
  }

  let min = Math.floor(diff / (1000 * 60));
  if (min < 60) {
    return min + "분 전";
  }
  let hour = Math.floor(diff / (1000 * 60 * 60));
  if (hour < 24) {
    return hour + "시간 전";
  }
  let day = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (day < 7) {
    return day + "일 전";
  }
  let week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  if (week < 5) {
    return week + "주 전";
  }
  let month = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 5));
  if (month < 12) {
    return month + "개월 전";
  }
  let year = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 5 * 12));
  return year + "년 전";
};

const relativeTimeFn = () => {
  videoRelativeTime.forEach((time) => {
    const createdAt = time.dataset.createdAt;
    const relativeTime = formatDate(createdAt);
    time.innerText += " " + relativeTime;
  });
};
relativeTimeFn();

const sideMenuMini = document.querySelector(".side-menu--mini");
const sideMenu = document.querySelector(".side-menu");
const burgerIcon = document.querySelector(".header__bars");

let toggle = "normal";

if (localStorage.getItem("normal") === "false") {
  sideMenuMini.style.display = "flex";
  sideMenu.style.display = "none";
  toggle = "mini";
}
const handleMenu = () => {
  if (toggle === "normal") {
    sideMenu.style.display = "none";
    sideMenuMini.style.display = "flex";
    localStorage.setItem("normal", false);
    toggle = "mini";
  } else if (toggle === "mini") {
    sideMenu.style.display = "block";
    sideMenuMini.style.display = "none";
    toggle = "normal";
    localStorage.setItem("normal", true);
  }
};

burgerIcon.addEventListener("click", handleMenu);
