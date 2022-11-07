export const localsMiddleware = (req, res, next) => {
  // 세션에 저장된 로그인 정보가 true또는 false이면 locals에도 로그인 정보를 기록한다.
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  // 세션에 저장된 유저정보를 locals에도 저장한다.
  res.locals.loggedInUser = req.session.user || {};
  next();
};
