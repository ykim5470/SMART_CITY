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
const { model_list } = require("./models");
const schedule = require("node-schedule");


// Routers
const index_router = require("./routes/index");
const { requestLogout } = require("./api/requestLogout");
const { model } = require("@tensorflow/tfjs-layers");

// // Sequelize 
// models.sequelize
//   .sync({ force:false})
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
      // ?????? ??????
      tokenArray = await requestToken(req, res);
      let access_token = tokenArray[0];

      console.log(tokenArray);

      // ?????? ?????? (access_token??? expires_in?????? ?????? ??????)
      await res.cookie("token", tokenArray[0], {
        httpOnly: true,
        maxAge: 3600000, //access_token ???????????? 1??????(1000ms==1s)
      });

      const token = await tokenToJson(req, res, access_token);

      // ?????? ???????????? ????????? ??????
      if (req.session.userInfo == undefined) {
        req.session.userInfo = token;
      }

      // ????????? ??? ??? ?????? ?????? DB ?????? ??? dashboard redirect
      await userCheck(req, res, token, tokenArray);
    } else {
      console.log(
        "?????? STATE??? ?????? STATE??? ???????????? ????????????. ???, ????????? ??????"
      );
    }
  } catch (err) {
    console.log(err);
  }
});


// ?????? ?????? ?????? ???, ?????? halt
app.use(async(error,req,res,next)=>{
  console.error(error) // log an error
  let current_running_models = await model_list.findAll({where: {run_status: 'running'}, attributes: ['md_id']}).then(
    (running_md_id) => {
      let running_md_id_str = JSON.stringify(running_md_id)
      let running_md_id_value = JSON.parse(running_md_id_str)
      return running_md_id_value
    }
  )
  
  current_running_models.map(async(el,idx) => {
    await model_list.update({run_status: 'halt'}, {where: {md_id: el['md_id']}})
    let jobs = schedule.scheduledJobs
    var running_jobs = jobs[el['md_id']];
    running_jobs.cancel()
    console.log('500 internel server error scheduler halt')
    next()
  })
  res.status(500).send('500 Internel server error!')
  })

// session ????????? ????????? ????????? ?????? 
app.use(async (req, res, next) => {
  if(req.session.userInfo == undefined){
    res.redirect('/')
  }
})

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

//     // // ?????? ??????????????? 10??? ????????? ??? ?????? ?????????
//     // if (
//     //   tokenjson.exp - Math.floor(Date.now() / 1000) < 1 * 60 &&
//     //   refresh_token_result.length !== 0
//     // ) {
//     //   // ?????? ????????? ??? ?????? ?????? ??????
//     //   console.log("10??? ?????? ?????????");
//     //   res.clearCookie("token");
//     //   // ?????? ?????????
//     //   tokenArray = await requestRefreshToken(req, res, refresh_token_result[0]);
//     //   console.log("?????? ????????? ??????");

//     //   await auth.update({ refreshToken: null }, { where: { userId: userId } });
//     //   refresh_token_result = new Array();

//     //   // ????????? ???????????? session update
//     //   const token = await tokenToJson(req, res, tokenArray[0]);

//     //   console.log("?????? ?????? ????????? ??? ??????????????? ???.");
//     //   req.session.userInfo = token;

//     //   // ?????? ??????
//     //   let publicKey = await requestPublicKey();
//     //   let verifyOptions = {
//     //     issuer: "urn:datahub:cityhub:security",
//     //     algorithm: "RS256",
//     //   };
//     //   try {
//     //     let decoded = jwt.verify(req.cookies.token, publicKey, verifyOptions);
//     //     if (decoded.userId.length === 0 || decoded.userId === undefined) {
//     //       console.log("????????????. ?????????????????? ??????");
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
  //????????????
  dash_handler(socket);
  // ???????????? ??????
  model_scheduler(socket);

  // ?????? ????????? ??? ??????
  // old_dataset_select(socket)

  // ????????? ??? ??????
  dataset_select(socket);

  // ?????? ?????? ??? ?????? ?????? API calling; attributes GET
  // old_analysis_select(socket)

  // ?????? ??? ?????? ?????? API calling; attributes GET
  analysis_select(socket);

  // ?????? ?????? ??????
  model_data(socket);
  }catch(err){
    console.log(err)
  }
});
