const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const BASE_JS = "./src/client/js/";
module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  mode: "development",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  module: {
    rules: [
      {
        // 정규식에서 .은 분류할때 사용되는 문자로 그 기능을 수행하지않게하려면
        // 앞에 \를 붙여야한다.
        // 여기서 test의 의미는 모든 .js 파일에 변환을 시키고 싶다를 의미한다.
        test: /\.js$/,
        //use는 이러한 변환을 적용시키고 싶다는 의미이다.
        use: {
          loader: "babel-loader",
          // 이 밑에 코드는 npm babel-loader 사이트에서 복붙했다.
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        //style-loader를 사용하면 js코드가 css파일을 읽는데,
        // 우리는 css파일 따로, js파일 따로 번들화 시키고싶다. 합쳐서 할 경우
        // js로딩을 기다려야하기 때문이다. 그래서 MiniCssExractPlugin.loader를 사용한다.
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
