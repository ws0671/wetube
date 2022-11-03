import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
});

// 이 미들웨어에서 this는 create되는 user를 가리킨다.
userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
  // 비밀번호를 bcrypt 모듈을 이용해 해싱하는 과정.
  // 비밀번호가 그대로 db에 저장되면 db가 해킹당했을때 비밀번호가 그대로 노출되기때문에
  // 해싱을 해줘서(암호화) 해싱된 값을 저장한다. hash()의 두번째 인자는 해싱하는 횟수
  // 해싱을 단방향이다. 같은 값을 해싱 알고리즘에 넣으면 해싱된 값이 계속 같은 값으로 나오지만, 해싱된 값을 역으로 원래 값으로 바꿀 수는 없다.
});

const User = mongoose.model("User", userSchema);
export default User;
