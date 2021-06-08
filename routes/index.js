const express = require("express");
const router = express.Router();
const auth = require("./auth");
const analysis = require("./analysis");

//router.get
router.get("/", function (req, res, next) {
  res.render("index");
})
router.get("/analysis/plus",analysis.output.plus)
router.get("/model_manage_board", auth.output.model_manage_board)
router.get("/model_register_board", auth.output.model_register_board)

//router.post
router.post("/analysis/insert",analysis.process.insert);
module.exports = router;