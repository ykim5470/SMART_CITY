const express = require("express");
const router = express.Router();
// const auth = require("./auth");
const new_auth = require('./new_auth')
const newAnaly = require("./newAnaly");
const ds = require("./ds");
const df = require("./df");
const dash = require("./dash");
const uploadFile = require('../public/js/helpers/upload_dir');
const ui = require('./ui');
const paginate = require('express-paginate');

router.get("/",function(req,res){res.render("index")})
//================================GET==================================
// Dashboard
router.get('/dashboard', dash.output.dashboard)
router.get('/dashboard/processed_data_load', dash.output.processed_data_load)
router.get('/dashboard/raw_data_load', dash.output.raw_data_load)
router.get('/dashboard/test', dash.output.testtest)


//Analysis 
router.get("/analysis/insert", newAnaly.output.insert);
router.get("/analysis/list",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/analysis/list/:page",paginate.middleware(10, 50), newAnaly.output.list);
router.get("/analysis/view/:al_id", newAnaly.output.view);
router.get("/analysis/edit/:al_id", newAnaly.output.edit);
router.get("/analysis/admin/deleted", newAnaly.output.viewDelList);
router.get("/analysis/duplication/check/:checkType", newAnaly.output.dupCheck);
router.get("/analysis/editCheck/:id", newAnaly.output.editChk);
//Model
// router.get('/model_manage_board/edit/:md_id', auth.output.register_edit)
// router.get("/model_manage_board",paginate.middleware(10, 50), auth.output.manage_board);
// router.get("/model_manage_board/:md_id", auth.output.manage_status);
// router.get("/model_register_board", auth.output.model_register_board);
// router.get('/model_registered_show/:md_id', auth.output.registered_show);

router.get('/test_test', new_auth.output.test_test)
router.get('/model_manage_board', paginate.middleware(10, 50), new_auth.output.manage_board)
router.get('/model_registered_show/:md_id', new_auth.output.registered_show);
router.get("/model_manage_board/:md_id", new_auth.output.manage_status);
router.get("/model_register_board", new_auth.output.model_register_board);


//Dataset
router.get("/ds/insert", ds.output.insert);
router.get("/ds/getNsVer/:id",ds.output.getNsVer);
router.get("/ds/duplication/check/:checkId", ds.output.dupCheck);
router.get("/ds/list",paginate.middleware(10, 50), ds.output.list);
router.get("/ds/list/:page",paginate.middleware(10, 50), ds.output.list);
router.get("/ds/view/:ds_id", ds.output.view);
router.get("/ds/edit/:ds_id", ds.output.edit);
//Dataflow
router.get("/df/insert", df.output.insert);
router.get("/df/list",paginate.middleware(10, 50), df.output.list);
router.get("/df/list/:page",paginate.middleware(10, 50), df.output.list);
router.get("/df/view/:df_id", df.output.view);

//==============================POST======================================
//Dashboard
router.post('/dashboard/test', dash.process.test)
//Analysis
router.post("/analysis/insert", newAnaly.process.insert);
//Model
// router.post("/model_manage_board", auth.process.status_update);
// router.post("/model/register", auth.process.register_init);
// router.post('/model/list/delete', auth.process.delete)
// router.post('/model/file_add',uploadFile.single("atch_origin_file_name"), auth.process.file_add)
// router.post('/model/register/complete', uploadFile.single("atch_origin_file_name"), auth.process.register_complete)
// router.post('/model/register/edit', uploadFile.single("atch_origin_file_name"), auth.process.register_edit)
// router.post('/model/redirect/edit', auth.process.edit_redirect)

router.post('/model/file_add',uploadFile.single("atch_origin_file_name"), new_auth.process.file_add)
router.post('/model/register/complete', uploadFile.single("atch_origin_file_name"), new_auth.process.register_complete)
router.post('/model/list/delete', new_auth.process.delete)
router.post("/model/register", new_auth.process.register_init);
router.post("/model_manage_board", new_auth.process.status_update);


//Dataset
router.post("/ds/inserted" , ds.process.insert)
//Dataset flow
router.post("/df/inserted", df.process.insert)


//===============================PUT======================================
//Analysis
router.put("/analysis/softDel/:al_id", newAnaly.process.softDelOne);
router.put("/analysis/softListDelete", newAnaly.process.softDelList);
router.put("/analysis/edited/:al_id", newAnaly.process.edit);
//Model
// router.put("/model_manage_board/:md_id", auth.process.edit);
router.put("/model_manage_board/:md_id", new_auth.process.edit);

//Dataset
router.put("/ds/softDel/:dataset_id", ds.process.dsSofeDel);
router.put("/ds/softListDelete", ds.process.softDelList);
router.put("/ds/edited/:ds_id", ds.process.edited);
//Dataflow
router.put("/df/softDel/:df_id", df.process.softDelOne);
router.put("/df/softDelList", df.process.softDelList);


//==============================DELETE======================================

router.use("/ui", ui);

module.exports = router;
