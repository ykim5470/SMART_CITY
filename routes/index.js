const express = require("express");
const router = express.Router();
const auth = require("./auth");
const auth = require("./analysis");

//router.get
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/", auth.output.fff);

//router.post

module.exports = router;