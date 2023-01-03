import { async } from "regenerator-runtime";
import fetch from "node-fetch";
import User from "../models/User";

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
