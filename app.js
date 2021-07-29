const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const models = require("./models/index");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const socket = require("socket.io");
const model_scheduler = require("./public/js/event_handlers/model_scheduler");
const dataset_select = require('./public/js/event_handlers/dataset_select')
const analysis_select = require('./public/js/event_handlers/analysis_select')

//routers
const index_router = require("./routes/index");

// models.sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("DB connected");
//   })
//   .catch((err) => {
//     console.log(`DB connection fail: ${err}`);
//   });

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use("/", index_router);

const server = app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});

// Socket setup
const io = socket(server, {
  allowEIO3: true, // false by default
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("Made socket connection");

  // 스케쥴러 조작
  model_scheduler(socket);

  // 데이터 셋 선택
  dataset_select(socket)

  // 선택 된 분석 모델 API calling; attributes GET
  analysis_select(socket)
});
