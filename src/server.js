import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import session from "express-session";
import flash from "express-flash";
import { localsMiddleware } from "./middlewares";
import { connection } from "mongoose";
import MongoStore from "connect-mongo";

const app = express();
const logger = morgan("dev");
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Embedder-Policy", "credentialless");
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Access-Control-Allow-Headers");
  res.header("Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(logger);
app.use(express.urlencoded({ extended: true }));
// fetch를 사용한 서버 통신을 할때 json 데이터를 읽기 위해 필요한 미들웨어.
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: connection.client }),
  })
);
app.use(flash());
app.use(localsMiddleware);
// 일반적으로 폴더들은 공개되지않는데 static을 사용하면 공개되게 할 수 있다.
// 앞에 인자는 공개될 경로를 나타낸다
app.use("/static", express.static("assets"));
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
