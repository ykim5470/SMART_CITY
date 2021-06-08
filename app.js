const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require('sequelize')
// const nunjucks = require("nunjucks");

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set("view engine", "html");
// nunjucks.configure("views", {
//   express: app,
//   watch: true,
// });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});
