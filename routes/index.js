const express = require("express");
const router = express.Router();
const auth = require("./auth");
const newAnaly = require("./newAnaly");
const ds = require("./ds");
const uploadFile = require('../public/js/helpers/upload_dir');
const ui = require('./ui');
const paginate = require('express-paginate')

router.get("/",function(req,res){res.render("index")})
//================================GET==================================
//Analysis 
router.get("/new/insert", newAnaly.output.insert);
router.get("/new/list",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/new/list/:page",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/new/view/:al_id", newAnaly.output.view);
router.get("/new/edit/:al_id", newAnaly.output.edit);
router.get("/new/admin/deleted", newAnaly.output.viewDelList);
router.get("/new/duplication/check/:checkName", newAnaly.output.dupCheck);
//Model
router.get('/model_manage_board/edit/:md_id', auth.output.register_edit)
router.get("/model_manage_board",paginate.middleware(10, 50), auth.output.manage_board);
router.get("/model_manage_board/:md_id", auth.output.manage_status);
router.get("/model_register_board", auth.output.model_register_board);
router.get('/model_registered_show/:md_id', auth.output.registered_show);
//Dataset
router.get("/ds/insert", ds.output.insert);
router.get("/ds/getNsVer/:id",ds.output.getNsVer);
router.get("/ds/duplication/check/:checkId", ds.output.dupCheck);
router.get("/ds/list",paginate.middleware(10, 50), ds.output.list);
router.get("/ds/list/:page",paginate.middleware(10, 50), ds.output.list);
router.get("/ds/view/:ds_id", ds.output.view);


//==============================POST======================================
//Analysis
router.post("/new/insert", newAnaly.process.insert);
//Model
router.post("/model_manage_board", auth.process.status_update);
router.post("/model/register", auth.process.register_init);
router.post('/model/list/delete', auth.process.delete)
router.post('/model/file_add',uploadFile.single("atch_origin_file_name"), auth.process.file_add)
router.post('/model/register/complete', uploadFile.single("atch_origin_file_name"), auth.process.register_complete)
router.post('/model/register/edit', uploadFile.single("atch_origin_file_name"), auth.process.register_edit)
router.post('/model/redirect/edit', auth.process.edit_redirect)
//Dataset
router.post("/ds/inserted" , ds.process.insert)


//===============================PUT======================================
//Analysis
router.put("/new/softDel/:al_id", newAnaly.process.tbSofeDel);
router.put("/new/softListDelete", newAnaly.process.softDelList);
router.put("/new/edited/:al_id", newAnaly.process.edit);
//Model
router.put("/model_manage_board/:md_id", auth.process.edit);
//Dataset
router.put("/ds/softDel/:dataset_id", ds.process.dsSofeDel);
router.put("/ds/softListDelete", ds.process.softDelList);

//==============================DELETE======================================

router.use("/ui", ui);

module.exports = router;
