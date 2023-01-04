import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import fetch from "node-fetch";

import { async } from "regenerator-runtime";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const {
    params: { id },
  } = req;
  // populate -> 사전적 정의: (서류에 데이터를) 덧붙이다
  // 이렇게하면 찾은 video의 owner에 '연결된' User 정보를 '모두' 가져와 붙여준다.
  // 그리고 이것을 이용하기 위해 ref로 'User'와 연결시켜준 것이다.
  // deep populate가 가능하여서 깊게 연쇄적으로 참조할 수 있다.
  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    });

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (req.session.loggedIn) {
    const {
      session: {
        user: { _id },
      },
    } = req;
    const user = await User.findById(_id);
    return res.render("watch", { pageTitle: video.title, video, user });
  }
  // console.log(video);

  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  // 403에러는 forbidden이다. 비디오 작성자와 로그인한 사람의 id를 비교하여 다르면 edit에
  // 접근할 수 없도록한다.
  if (String(video.owner._id) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render(404, { pageTitle: "Video not found." });
  }
  // 마찬가지로 postEdit에도 동일하게 보안처리를 해준다.
  if (String(video.owner._id) !== String(_id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Change saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { user: _id } = req.session;
  const { title, description, hashtags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";

  const { video, thumb } = req.files;
  try {
    const newVideo = await Video.create({
      title,
      owner: _id,
      fileUrl: isHeroku ? video[0].location : `/${video[0].path}`,
      // 일반 저장하면 경로가 백슬래쉬로 구분되어 저장이된다. 따라서 정규식을 이용해
      // 백슬래쉬를 -> 슬래쉬로 바꾸어주고 저장한다.
      thumbUrl: isHeroku
        ? thumb[0].location.replace(/[\\]/g, "/")
        : `/${thumb[0].path.replace(/[\\]/g, "/")}`,
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
  const {
    user: { _id },
  } = req.session;
  // deleteVideo도 동일하게 코드를 짜준다.
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  // 지워지는 video에 연결된 comment들 삭제 로직.
  await Comment.deleteMany({ video: id });
  //user에 저장된 videos도 지워주는 로직
  user.videos.splice(user.videos.indexOf(_id), 1);
  user.save();
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
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    // status()는 상태만 보내주고
    // sendStatus는 상태를 보내주고 연결을 끊는다.
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  const singleComment = await Comment.findById(comment._id).populate("owner");
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({
    newCommentId: comment._id,
    ownerAvatarUrl: singleComment.owner.avatarUrl,
    ownerName: singleComment.owner.name,
  });
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id: commentId },
  } = req;

  const comment = await Comment.findById(commentId).populate("owner");
  const videoId = comment.video;
  // session의 유저 id와 댓글 쓴 사람의 id가 다르면 삭제를 금지한다.
  if (String(_id) !== String(comment.owner._id)) {
    return res.sendStatus(404);
  }
  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }
  video.comments.splice(video.comments.indexOf(videoId), 1);
  video.save();
  await Comment.findByIdAndDelete(commentId);

  return res.sendStatus(200);
};

// 유튜브로 업로드

export const getYoutubeUpload = (req, res) => {
  return res.render("youtube-upload", { pageTitle: "Upload YouTube Video" });
};
export const postYoutubeUpload = async (req, res) => {
  // 유저가 입력한 주소로부터 id 구하기
  const {
    user: { _id },
  } = req.session;
  const { videoUrl } = req.body;
  let { title, description, hashtags } = req.body;
  let id;
  if (videoUrl.match(/(youtu\.be)/g)) {
    id = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
  } else {
    const queryString = videoUrl.substring(videoUrl.indexOf("?"));
    const params = new URLSearchParams(queryString);
    id = params.get("v");
  }
  if (!id) {
    req.flash("error", "정확한 주소를 입력해주세요.");
    return res.status(400).redirect("youtube-upload");
  }
  const youtubeBaseURL = "https://www.googleapis.com/youtube/v3";
  const config = {
    key: process.env.YOUTUBE_API,
    part: "snippet",
    id,
  };
  const requestParams = new URLSearchParams(config).toString();
  const URL = `${youtubeBaseURL}/videos?${requestParams}`;
  const video = await (await fetch(URL)).json();
  // 가져온 정보를 바탕으로 video 생성
  try {
    if (!title) {
      title = video.items[0].snippet.title;
    }
    if (!description) {
      description = video.items[0].snippet.description;
    }
    const createdVideo = await Video.create({
      fileUrl: id,
      thumbUrl: video.items[0].snippet.thumbnails.high.url,
      title,
      description,
      youtubeVideo: true,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    user.videos.push(createdVideo._id);
    await user.save();
    req.session.loggedInUser = user;
    req.flash("info", "성공적으로 업로드 되었습니다.");
    return res.status(200).redirect(`${createdVideo._id}`);
  } catch (error) {
    req.flash("error", "알 수 없는 오류가 발생했습니다.");
    return res.status(400).redirect("youtube-upload");
  }
};

// 구독 페이지
export const getSubscribe = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const user = await User.findById(_id).populate({
    path: "subscribes",
    populate: {
      path: "videos",
      populate: {
        path: "owner",
      },
    },
  });
  // console.log(user.subscribes[0].videos);
  const videos = [];
  user.subscribes.forEach((i) => videos.push(...i.videos));
  // 최신순으로 비디오 정렬
  videos.sort((a, b) => b.createdAt - a.createdAt);
  return res.render("subscribe", { pageTitle: "Subscribe", videos });
};
