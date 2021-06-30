const express = require("express");
const router = express.Router();
const uihtml = require("./uihtml")

router.get("/test/001", uihtml.output.test001);
router.get("/test/002", uihtml.output.test002);

module.exports = router;