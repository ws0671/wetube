import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: "/static/defaultProfile.jpg" },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  // 내가 구독중인 사람들
  subscribes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // 나를 구독중인 사람들
  subscribers: [{ type: mongoose.Schema.Types.ObjectId }],
});

userSchema.pre("save", async function () {
  // isModified는 password가 수정될 때만 if안의 코드를 작동시켜준다.
  // 따라서 비디오 업로드시에 save될때 password hashing을 막을 수 있다.
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
