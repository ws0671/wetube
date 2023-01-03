import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: { type: String, required: true, trim: true },
  youtubeVideo: { type: Boolean, default: false },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 2 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
// 아래에 나온 미들웨어를 사용하는 방식은 update할때는 update에 대한 미들웨어가 없기 때문에 다른 방법으로 hashtags의 로직을 깔끔하게 하면 좋을 것 같다.
// 이 파일에 function을 만든뒤 export하여 사용한다.=> 좋은 방법이지만 더 좋은 방법이있다.
// 모델에 static 함수를 추가한다.(커스텀 함수를 추가한다.) => That's cool
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// }); // 미들웨어, save이벤트 발생전에 실행됨. pre이기때문.

// 모델 생성전에 미들웨어를 작성한다.
const Video = mongoose.model("Video", videoSchema); // 모델 생성

export default Video;
