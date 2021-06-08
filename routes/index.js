const express = require("express");
const router = express.Router();
const auth = require("./auth");
const analysis = require("./analysis");

//router.get
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/analysis/plus",analysis.output.plus)
router.get("/", auth.output.fff);

//router.post
router.post("/analysis/insert",analysis.process.insert);
module.exports = router;