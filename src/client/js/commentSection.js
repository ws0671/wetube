const { async } = require("regenerator-runtime");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentCount = document.querySelector(".comment-count");
const commentDeleteBtn = document.querySelectorAll("#comment-delete-btn");
const commentTime = document.querySelectorAll(".comment__time");
// fake comment를 만드는 fn으로, 만약 새로고침을 하면 fake comment가 사라진다.
// 그리고 pug에서 렌더링을 해주기때문에
// fake comment -> 새로고침 -> fake comment 사라짐 -> pug에서 db데이터 렌더링
// 이런순으로 동작하기때문에 실시간으로 댓글이 작성되는 것 처럼 보여진다.
const addComment = (text, id, avatarUrl, name) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const commentContainerDiv = document.createElement("div");
  commentContainerDiv.classList.add("comment__container");

  const commentDeleteBtn = document.createElement("button");
  commentDeleteBtn.id = "comment-delete-btn";
  commentDeleteBtn.innerText = "삭제";
  // commentDeleteBtn를 생성하자마자 클릭(delete)이벤트 설정하기.
  commentDeleteBtn.onclick = handleDelete;
  const img = document.createElement("img");
  img.src = avatarUrl;
  img.classList.add("comment__avatar");

  const commentInfoDiv = document.createElement("div");
  commentInfoDiv.classList.add("comment__info");

  const commentName = document.createElement("div");
  commentName.classList.add("comment__name");
  commentName.innerText = name;

  const commentTimeSpan = document.createElement("span");
  commentTimeSpan.classList.add("comment__time");
  commentTimeSpan.innerText = "현재";

  const span = document.createElement("span");
  span.innerText = `${text}`;

  newComment.appendChild(commentContainerDiv);
  newComment.appendChild(commentDeleteBtn);
  commentContainerDiv.appendChild(img);
  commentContainerDiv.appendChild(commentInfoDiv);
  commentInfoDiv.appendChild(commentName);
  commentInfoDiv.appendChild(span);
  commentName.appendChild(commentTimeSpan);
  videoComments.prepend(newComment);
};
const renderCommentCount = () => {
  const commentsLi = document.querySelectorAll(".video__comments ul li");

  const liTagCount = commentsLi.length;
  commentCount.innerText = `댓글 ${liTagCount}개`;
};

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
const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("input");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  // 내용이 없으면 전송 안하도록 하기.
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    // 댓글의 고유 id
    const { newCommentId, ownerAvatarUrl, ownerName } = await response.json();
    addComment(text, newCommentId, ownerAvatarUrl, ownerName);
    renderCommentCount();
  }
};

const handleDelete = async (e) => {
  const commentId = e.target.parentNode.dataset.id;
  const li = e.target.parentNode;
  await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  li.remove();
  renderCommentCount();
};

const relativeTimeFn = () => {
  commentTime.forEach((time) => {
    const createdAt =
      time.parentNode.parentNode.parentNode.parentNode.dataset.createdAt;
    const relativeTime = formatDate(createdAt);
    time.innerText = relativeTime;
  });
};
relativeTimeFn();
if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (commentDeleteBtn) {
  commentDeleteBtn.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
