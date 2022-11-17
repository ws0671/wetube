const path = require("path");
module.exports = {
  entry: "./src/client/js/main.js",
  output: {
    filename: "main.js",
    //path.resolve()는 인자들을 합쳐서 반환해준다. 경로들을 합쳐주는 역할이다.
    path: path.resolve(__dirname, "assets", "js"),
  },
  // mode는 development모드와 production모드가 있는데
  // 개발모드로 할경우 코드가 우리가 읽기 쉽게 변형되고
  // production모드는 배포하는 코드라 코드가 압축되어 효율성있게 변형된다.
  mode: "development",
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
        // 이 코드는 역순으로 loader를 실행시킨다. sass-loader->css-loader->style-loader 순으로 실행.
        // 1. sass-loader가 scss확장자 파일을 css파일로 변환시킨다.
        // 2. css-loader가 @import, url()등의 최신 css코드를 브라우저가 이해할 수 있는 코드로 변환시킨다.
        // 3. style-loader가 위 과정으로 변환시킨 css코드를 DOM 내부에 적용시킨다.
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
