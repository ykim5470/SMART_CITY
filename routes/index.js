const express = require("express");
const router = express.Router();
const auth = require("./auth");
const newAnaly = require("./newAnaly");
const uploadFile = require('../public/js/helpers/upload_dir');
const ui = require('./ui');
const paginate = require('express-paginate')

router.get("/new/insert", newAnaly.output.insert);
router.get("/new/list",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/new/list/:page",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/new/view/:al_id", newAnaly.output.view);
router.get("/new/edit/:al_id", newAnaly.output.edit);
router.get("/new/admin/deleted", newAnaly.output.viewDelList);
router.get("/new/duplication/check/:checkName", newAnaly.output.dupCheck);

router.get('/model_manage_board/edit/:md_id', auth.output.register_edit)
router.get("/model_manage_board",paginate.middleware(10, 50), auth.output.manage_board);
router.get("/model_manage_board/:md_id", auth.output.manage_status);
router.get("/model_register_board", auth.output.model_register_board);


//router.post
router.post("/new/insert", newAnaly.process.insert);

router.post("/model_manage_board", auth.process.status_update);
router.post("/model/register", auth.process.register_init);
router.post('/model/list/delete', auth.process.delete)
router.post('/model/file_add',uploadFile.single("atch_origin_file_name"), auth.process.file_add)
router.post('/model/register/complete',uploadFile.single("atch_origin_file_name"), auth.process.register_complete)

//router.put = update관련
router.put("/model_manage_board/:md_id", auth.process.edit);

router.put("/new/softDel/:al_id", newAnaly.process.tbSofeDel);
router.put("/new/softListDelete", newAnaly.process.softDelList);
router.put("/new/edited/:al_id", newAnaly.process.edit);

//router.delete = delete 관련

router.use("/ui", ui);

module.exports = router;
