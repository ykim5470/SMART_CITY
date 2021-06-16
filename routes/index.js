const express = require("express");
const router = express.Router();
const auth = require("./auth");
const analysis = require("./analysis");
const uploadFile = require("../helpers/upload_dir");

//router.get
router.get("/", function (req, res, next) {
	res.render("index");
});
router.get("/analysis/plus", analysis.output.plus);
router.get("/analysis/list", analysis.output.show);
router.get("/analysis/view/:al_id", analysis.output.view);
router.get("/analysis/edit/:al_id", analysis.output.edit);
router.get("/model_manage_board", auth.output.manage_board);
router.get("/model_manage_board/:md_id", auth.output.manage_status);
router.get("/model_register_board", auth.output.model_register_board);

//router.post
router.post("/analysis/insert", analysis.process.insert);
router.post("/analysis/column/:al_id", analysis.process.columnInsert);
router.post("/analysis/listDelete", analysis.process.deleteList);
router.post("/model/register/complete", uploadFile.single("atch_origin_file_name"), auth.process.register_complete);
router.post("/model_manage_board", auth.process.status_update);
router.post("/model/register", auth.process.register_init);
router.post('model/register/input', auth.process.input_add)

//router.put = update관련
router.put("/analysis/edited/:al_id", analysis.process.edit);
router.put("/model_manage_board/:md_id", auth.process.edit);
//router.delete = delete 관련
router.delete("/analysis/delete/:al_id", analysis.process.delete);
router.delete("/analysis/column/delete/:col_id", analysis.process.colDelete);
router.delete('/model_manage_board', auth.process.delete)
module.exports = router;
