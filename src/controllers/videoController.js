import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  // populate -> 사전적 정의: (서류에 데이터를) 덧붙이다
  // 이렇게하면 찾은 video의 owner에 '연결된' User 정보를 '모두' 가져와 붙여준다.
  // 그리고 이것을 이용하기 위해 ref로 'User'와 연결시켜준 것이다.
  const video = await Video.findById(id).populate("owner");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
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
  const { user: _id } = req.session;
  const { title, description, hashtags } = req.body;
  const { path: fileUrl } = req.file;
  try {
    const newVideo = await Video.create({
      title,
      owner: _id,
      fileUrl,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    // video를 생성한 뒤 생성한 비디오의 id를 user.video에 넣고 save()해준다.
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
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
