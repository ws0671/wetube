const { async } = require("regenerator-runtime");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentCount = document.querySelector(".comment-count");
const commentDeleteSpan = document.querySelectorAll(
  ".video__comments ul li span:last-child"
);

// fake comment를 만드는 fn으로, 만약 새로고침을 하면 fake comment가 사라진다.
// 그리고 pug에서 렌더링을 해주기때문에
// fake comment -> 새로고침 -> fake comment 사라짐 -> pug에서 db데이터 렌더링
// 이런순으로 동작하기때문에 실시간으로 댓글이 작성되는 것 처럼 보여진다.
const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "  ❌";
  // span2를 생성하자마자 클릭(delete)이벤트 설정하기.
  span2.onclick = handleDelete;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};
const renderCommentCount = () => {
  const commentsLi = document.querySelectorAll(".video__comments ul li");

  const liTagCount = commentsLi.length;
  commentCount.innerText = `댓글 ${liTagCount}개`;
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
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
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

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (commentDeleteSpan) {
  commentDeleteSpan.forEach((deleteSpan) => {
    deleteSpan.addEventListener("click", handleDelete);
  });
}
