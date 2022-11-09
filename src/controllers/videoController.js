import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  // 1. User모델로 db에서 user를 찾는다.
  const owner = await User.findById(video.owner);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  // 2. pug template에 user(owner) 정보를 보낸다.
  // 이 방법은 db에 두 번 요청하기 때문에 좋은 코드는 아니다. 다음 강의에 바꿔보자.
  return res.render("watch", { pageTitle: video.title, video, owner });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { title, description, hashtags } = req.body;
  const { id } = req.params;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render(404, { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  // 세션에서 id를 찾은 뒤 model video를 create할때 사용한다.
  // 그러면 현재 로그인한 유저의 id가 들어간다.
  // 결과적으로 만들어진 비디오에 현재 유저의 id가 기록된다.
  const { user: _id } = req.session;
  const { title, description, hashtags } = req.body;
  const { path: fileUrl } = req.file;
  try {
    await Video.create({
      title,
      owner: _id,
      fileUrl,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
