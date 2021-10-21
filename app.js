const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const nunjucks = require("nunjucks");
const socket = require("socket.io");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const models = require("./models/index");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const model_scheduler = require("./public/js/event_handlers/model_scheduler");
const dash_handler = require("./public/js/dashboard/dash_handler");
const model_data = require("./public/js/event_handlers/model_data");
const dataset_select = require("./public/js/event_handlers/dataset_select");
const analysis_select = require("./public/js/event_handlers/analysis_select");
const { tokenToJson } = require("./api/tokenToJson");
const { requestPublicKey } = require("./api/requestPublicKey");
const { requestToken } = require("./api/requestToken");
const { requestRefreshToken } = require("./api/requestRefreshToken");
const { userCheck } = require("./api/userCheck");
const { auth } = require("./models");

// Routers
const index_router = require("./routes/index");
const { requestLogout } = require("./api/requestLogout");

// Sequelize 
// models.sequelize
//   .sync({ force: false})
//   .then(() => {
//     console.log("DB connected");
//   })
//   .catch((err) => {
//     console.log(`DB connection fail: ${err}`);
//   });

dotenv.config();
// Auth global variables
global.OAUTHURL = "http://203.253.128.181:30084";
global.REDIRECT_URI = process.env.REDIRECT_URI;
global.CLIENT_ID = process.env.CLIENT_ID;
global.CLIENT_SECRET = process.env.CLIENT_SECRET;
global.STATE =
  "CB474281CA1BBDCAFAC231B39A23DC4DF786EFF8147C4E72B9807785AFEE48BB";

let tokenArray;
let refresh_token_result = new Array();

const app = express();
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

// Session Middleware
const sessionMiddleware = session({
  secret: "userInfo",
  resave: true,
  saveUninitialized: true,
  store: new FileStore(),
  // cookie: { maxAge: 3600000 },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(sessionMiddleware, index_router);

// SSO Redirect Page Router
app.get("/Oauth/token", sessionMiddleware, async (req, res, next) => {
  try {
    if (STATE === res.req.query.state) {
      // 토큰 요청
      tokenArray = await requestToken(req, res);
      let access_token = tokenArray[0];

      console.log(tokenArray);

      // 쿠키 생성 (access_token을 expires_in만큼 쿠키 생성)
      await res.cookie("token", tokenArray[0], {
        httpOnly: true,
        maxAge: 3600000, //access_token 유효기간 1시간(1000ms==1s)
      });

      const token = await tokenToJson(req, res, access_token);

      // 처음 로그인한 유저일 경우
      if (req.session.userInfo == undefined) {
        req.session.userInfo = token;
      }

      // 로그인 할 때 유저 정보 DB 처리 및 dashboard redirect
      await userCheck(req, res, token, tokenArray);
    } else {
      console.log(
        "보낸 STATE와 받은 STATE가 일치하지 않습니다. 즉, 로그인 실패"
      );
    }
  } catch (err) {
    console.log(err);
  }
});


// app.use(async (req, res, next) => {
//   let token = await req.cookies.token;

//   if (req.originalUrl === "/") {
//     next();
//   } else if (token === undefined) {
//     res.redirect("/");
//   } else {
//     let tokenjson = await tokenToJson(req, res, token);
//     let userId = tokenjson.userId;

//     await auth
//       .findOne({ where: { userId: userId }, attributes: ["refreshToken"] })
//       .then((result) => {
//         const { refreshToken } = result;
//         if (refreshToken != null) {
//           refresh_token_result[0] = refreshToken;
//         } else {
//           requestLogout(req, res);
//         }
//       });

//     // // 토큰 만료시간이 10분 이하일 때 토큰 재발급
//     // if (
//     //   tokenjson.exp - Math.floor(Date.now() / 1000) < 1 * 60 &&
//     //   refresh_token_result.length !== 0
//     // ) {
//     //   // 토큰 재발급 전 기존 쿠키 삭제
//     //   console.log("10분 이하 남았음");
//     //   res.clearCookie("token");
//     //   // 토큰 재발급
//     //   tokenArray = await requestRefreshToken(req, res, refresh_token_result[0]);
//     //   console.log("토큰 재발급 완료");

//     //   await auth.update({ refreshToken: null }, { where: { userId: userId } });
//     //   refresh_token_result = new Array();

//     //   // 재발급 토큰으로 session update
//     //   const token = await tokenToJson(req, res, tokenArray[0]);

//     //   console.log("이건 토큰 재발급 시 실행되어야 함.");
//     //   req.session.userInfo = token;

//     //   // 토큰 검증
//     //   let publicKey = await requestPublicKey();
//     //   let verifyOptions = {
//     //     issuer: "urn:datahub:cityhub:security",
//     //     algorithm: "RS256",
//     //   };
//     //   try {
//     //     let decoded = jwt.verify(req.cookies.token, publicKey, verifyOptions);
//     //     if (decoded.userId.length === 0 || decoded.userId === undefined) {
//     //       console.log("토큰만료. 로그인창으로 이동");
//     //       res.redirect("/");
//     //     }
//     //   } catch (err) {
//     //     console.log(err);
//     //   }
//     // }
//     return;
//   }
//   next();
// });

const server = app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});

// Socket setup
const io = socket(server, {
  allowEIO3: true, // false by default
});

// Socket Connection
io.on("connection", (socket) => {
  try{
  console.log("Made socket connection");
  //대시보드
  dash_handler(socket);
  // 스케쥴러 조작
  model_scheduler(socket);

  // 이전 데이터 셋 선택
  // old_dataset_select(socket)

  // 데이터 셋 선택
  dataset_select(socket);

  // 이전 선택 된 분석 모델 API calling; attributes GET
  // old_analysis_select(socket)

  // 선택 된 분석 모델 API calling; attributes GET
  analysis_select(socket);

  // 분석 모델 정보
  model_data(socket);
  }catch(err){
    console.log(err)
  }
});
