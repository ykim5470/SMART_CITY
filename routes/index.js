const express = require("express");
const router = express.Router();
const auth = require("./auth");
const analysis = require("./analysis");
const multer = require('multer')
var upload = multer({ dest: 'uplodats/'})

//router.get
router.get("/", function (req, res, next) {
  res.render("index");
})
router.get("/analysis/plus",analysis.output.plus)
router.get("/analysis/view",analysis.output.show)
router.get("/model_manage_board", auth.output.model_manage_board)
router.get("/model_register_board", auth.output.model_register_board)

//router.post
router.post("/analysis/insert", analysis.process.insert);
router.post("/model_register_board", auth.process.model_register_board)
module.exports = router;