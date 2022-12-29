import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import User from "./models/User";

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "wetube-ws0671/images",
  acl: "public-read",
  // key: function (request, file, ab_callback) {
  //   const newFileName = Date.now() + "-" + file.originalname;
  //   const fullPath = "images/" + newFileName;
  //   ab_callback(null, fullPath);
  // },
});
const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "wetube-ws0671/videos",
  acl: "public-read",
  // key: function (request, file, ab_callback) {
  //   const newFileName = Date.now() + "-" + file.originalname;
  //   const fullPath = "videos/" + newFileName;
  //   ab_callback(null, fullPath);
  // },
});
// heroku에 있다면 true를 반환
const isHeroku = process.env.NODE_ENV === "production";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isHeroku = isHeroku;
  // console.log(res.locals.loggedInUser.subscribes);
  // console.log(res.locals.loggedInUser.subscribes.avatarUrl);
  // console.log(res.locals.loggedInUser.subscribes.name);
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Login first");
    return res.redirect("/");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatar/",
  // limits: {
  //   fileSize: 3000000,
  // },
  storage: isHeroku ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
  dest: "uploads/video/",
  // limits: { fileSize: 10000000 },
  storage: isHeroku ? s3VideoUploader : undefined,
});
