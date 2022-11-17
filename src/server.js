import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import session from "express-session";
import { localsMiddleware } from "./middlewares";
import { connection } from "mongoose";
import MongoStore from "connect-mongo";

const app = express();
const logger = morgan("dev");
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: connection.client }),
  })
);
app.use(localsMiddleware);
// 일반적으로 폴더들은 공개되지않는데 static을 사용하면 공개되게 할 수 있다.
// 앞에 인자는 공개될 경로를 나타낸다
app.use("/static", express.static("assets"));
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
