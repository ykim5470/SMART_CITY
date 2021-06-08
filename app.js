const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require('sequelize');
const models = require('./models/index');
const nunjucks = require("nunjucks");

//routers 
const index_router = require('./routes/index');
const model_manage_board_router = require('./routes/model_manage_board');


models.sequelize.sync().then(() => {
  console.log('DB connected')
}).catch(err => {
  console.log(`DB connection fail: ${err}`)
})

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use('/', index_router);
app.get('/model_manage_board', model_manage_board_router)
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});
