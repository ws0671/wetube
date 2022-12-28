const message = (type, text) => {
  const body = document.body;
  const div = document.createElement("div");
  div.className = `flash-message ${type}`;
  div.innerText = text;
  body.prepend(div);
};

export default message;
