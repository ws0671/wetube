import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  see,
  getChangePassword,
  postChangePassword,
  subscribe,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";
import {
  startGithubLogin,
  finishGithubLogin,
  starKakaoLogin,
  finishKakaoLogin,
  startNaverLogin,
  finishNaverLogin,
} from "../controllers/socialLoginController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, starKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);
userRouter.get("/naver/start", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/finish", publicOnlyMiddleware, finishNaverLogin);
userRouter.post("/:id/subscribe", protectorMiddleware, subscribe);
userRouter.get("/:id", see);

export default userRouter;
