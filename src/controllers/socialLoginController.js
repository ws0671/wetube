import { async } from "regenerator-runtime";
import fetch from "node-fetch";
import User from "../models/User";

// 깃허브 로그인
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        name: userData.name,
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// 카카오 로그인
export const starKakaoLogin = (req, res) => {
  const isHeroku = process.env.NODE_ENV === "production";
  const baseUrl = `https://kauth.kakao.com/oauth/authorize`;
  const config = {
    response_type: "code",
    redirect_uri: isHeroku
      ? "https://wetube-ws0671.koyeb.app/users/kakao/finish"
      : "http://localhost:4000/users/kakao/finish",
    client_id: process.env.KAKAO_CLIENT,
    // scope: "profile_nickname,profile_image,account_email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const isHeroku = process.env.NODE_ENV === "production";
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: isHeroku
      ? "https://wetube-ws0671.koyeb.app/users/kakao/finish"
      : "http://localhost:4000/users/kakao/finish",
    client_secret: process.env.KAKAO_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    let user = await User.findOne({
      email: userData.kakao_account.email,
    });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.properties.profile_image,
        name: userData.properties.nickname,
        username: userData.kakao_account.email,
        email: userData.kakao_account.email,
        socialOnly: true,
        password: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// 네이버 로그인
export const startNaverLogin = (req, res) => {
  const isHeroku = process.env.NODE_ENV === "production";
  const baseUrl = `https://nid.naver.com/oauth2.0/authorize`;
  const config = {
    response_type: "code",
    redirect_uri: isHeroku
      ? "https://wetube-ws0671.koyeb.app/users/naver/finish"
      : "http://localhost:4000/users/naver/finish",
    client_id: process.env.NAVER_CLIENT,
    state: process.env.NAVER_STATE,
    // scope: "profile_nickname,profile_image,account_email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const finishNaverLogin = async (req, res) => {
  const isHeroku = process.env.NODE_ENV === "production";
  const baseUrl = "https://nid.naver.com/oauth2.0/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.NAVER_CLIENT,
    redirect_uri: isHeroku
      ? "https://wetube-ws0671.koyeb.app/users/naver/finish"
      : "http://localhost:4000/users/naver/finish",
    client_secret: process.env.NAVER_SECRET,
    code: req.query.code,
    state: req.query.state,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://openapi.naver.com";
    const userData = await (
      await fetch(`${apiUrl}/v1/nid/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    let user = await User.findOne({
      email: userData.response.email,
    });
    const usernameIndex = userData.response.email.indexOf("@");
    const username = userData.response.email.slice(0, usernameIndex);
    if (!user) {
      user = await User.create({
        username,
        name: userData.response.nickname,
        email: userData.response.email,
        avatarUrl: userData.response.profile_image,
        socialOnly: true,
        password: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
