import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import { async } from "regenerator-runtime";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, password, password2, email } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
    // 브라우저가 적절한 행동을 취하게 하기위해 400(bad request)상태코드를 보낸다.
    // 저렇게 따로 보내지않으면, 200(sucess 상태코드)으로 판단하여 브라우저에서
    // 우측 상단에 비밀번호를 저장하나요?라고 팝업이 뜬다. 계정 생성이 성공한 줄로 오해하는 것이다.
    // 즉, 브라우저는 상태코드를 보고 판단한다.
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false }).populate(
    "subscribes"
  );

  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", "Login successful");
  return res.redirect("/");
};

export const logout = (req, res) => {
  // req.session.destroy();
  req.session.user = "";
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");

  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username },
    // req.file은 multer 미들웨어를 사용했을때만 쓸 수 있다.
    file,
  } = req;
  const sessionEmail = req.session.user.email;
  const sessionUsername = req.session.user.username;
  const isHeroku = process.env.NODE_ENV === "production";
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file
        ? isHeroku
          ? file.location
          : `/${file.path}`
        : avatarUrl,
      name,
      email,
      username,
    },
    { new: true }
  ).populate("subscribes");
  req.session.user = updatedUser;
  return res.redirect(`/users/${_id}`);
  // if (sessionEmail !== email && sessionUsername !== username) {

  // }
  // return res.render("edit-profile", {
  //   pageTitle: "Edit Profile",
  //   errorMessage: "email/username already exist.",
  // });
};
export const getChangePassword = (req, res) => {
  // 소셜 로그인 유저면 비밀번호 변경 못하도록함.
  if (req.session.user.socialOnly) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", {
    pageTitle: "Change Password",
  });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (oldPassword === newPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The old password equals new password",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  //db의 패스워드 변경
  user.password = newPassword;
  // user.save를 하면 pre middleware가 작동하여 새로운 비밀번호가 자동으로 해쉬화된다.
  await user.save();
  req.flash("info", "Password updated");
  // req.session.destroy();
  return res.redirect("/users/logout");
};

export const subscribe = async (req, res) => {
  // if (!req.session.loggedIn) {
  //   req.flash("error", "로그인이 필요한 서비스입니다.");
  //   return res.redirect(`/`);
  // }
  const {
    session: {
      user: { _id },
    },
    params: { id },
  } = req;
  //id는 비디오 주인

  let user = await User.findById(_id).populate("subscribes");
  let owner = await User.findById(id);

  // status 205는 reset content
  // 구독취소
  if (user.subscribes.some((i) => i._id == id)) {
    user.subscribes.splice(
      user.subscribes.findIndex((i) => i._id == id),
      1
    );
    await user.save();
    owner.subscribers.splice(owner.subscribers.indexOf(_id), 1);
    await owner.save();

    user = await User.findById(_id).populate("subscribes");
    owner = await User.findById(id);

    req.session.user = user;
    return res.status(202).json({
      userSubscribes: user.subscribes,
      ownerSubscribers: owner.subscribers,
    });
  }

  user.subscribes.push(id);
  await user.save();
  owner.subscribers.push(_id);
  await owner.save();
  user = await User.findById(_id).populate("subscribes");
  owner = await User.findById(id);
  req.session.user = user;
  // 202는 Accepted
  return res.status(200).json({
    userSubscribes: user.subscribes,
    ownerSubscribers: owner.subscribers,
  });
};
export const see = async (req, res) => {
  const { id } = req.params;
  // double populate 찾은 유저에 vidoes를 poplulate하고 거기에 owner를 populate함.
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user)
    return res.status(404).render("404", { pageTitle: "User not found." });
  return res.render("users/profile", { pageTitle: user.name, user });
};
