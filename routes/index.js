const express = require("express");
const router = express.Router();
const new_auth = require("./new_auth");
const admin_new_auth = require("./admin_new_auth");
const newAnaly = require("./newAnaly");
const ds = require("./ds");
const df = require("./df");
const dash = require("./dash");
const admin_dash = require("./admin_dash");
const uploadFile = require("../public/js/helpers/upload_dir");
const ui = require("./ui");
const paginate = require("express-paginate");
const { userController } = require("./controller");
const { tokenToJson } = require("../api/tokenToJson");
const { requestLogout } = require("../api/requestLogout");
const cookieParser = require("cookie-parser");

//================================GET==================================
// SSO Homepage
router.get("/", (req, res) => {
  console.log(REDIRECT_URI);
  console.log(CLIENT_ID);
  console.log(STATE);
  console.log("거침");
  res.redirect(
    "http://203.253.128.181:30084/oauth2.0/authorize?response_type=code&redirect_uri=" +
      REDIRECT_URI +
      "&client_id=" +
      CLIENT_ID +
      "&state=" +
      STATE
  );
});

router.get("/logout", async (req, res) => {
  const access_token = req.cookies.token;
  let tokenjson = await tokenToJson(req, res, access_token);
  await requestLogout(req, res);
  res.clearCookie("token");
  req.session.destroy();
  res.redirect("/");
});

// Dashboard
router.get("/dashboard", dash.output.dashboard);
router.get("/admin/dashboard",userController(), admin_dash.output.dashboard);
router.get("/dashboard/dataset_load/:data", dash.output.dataset_load);
router.get("/dashboard/data_load/:data", dash.output.data_load);
router.get("/dashboard/attr_load/:data", dash.output.attr_load);
router.get("/dashboard/treeTest/", dash.output.treeview);
router.get("/dashboard/widget_load/", dash.output.get_widget);

//Analysis
router.get("/analysis/insert", newAnaly.output.insert);
router.get("/analysis/list", paginate.middleware(10, 50), newAnaly.output.list);
router.get(
  "/analysis/list/:page",
  paginate.middleware(10, 50),
  newAnaly.output.list
);
router.get("/analysis/view/:al_id", newAnaly.output.view);
router.get("/analysis/edit/:al_id", newAnaly.output.edit);
router.get("/analysis/admin/deleted", newAnaly.output.viewDelList);
router.get("/analysis/duplication/check/:checkType", newAnaly.output.dupCheck);
router.get("/analysis/editCheck/:id", newAnaly.output.editChk);
//Model


// router.get(
//   '/test', paginate.middleware(10, 55),
//   new_auth.output.test
// )
// router.get(
//   '/test1', new_auth.output.test1
// )
router.get(
  "/dataAnalysisModels",
  paginate.middleware(10, 50),
  new_auth.output.list
);
router.get(
  "/admin/dataAnalysisModels",
  userController(),
  paginate.middleware(10, 50),
  admin_new_auth.output.list
);
// router.get("/dataAnalysisModelsView", new_auth.output.view);

router.get("/dataAnalysisModelModView", new_auth.output.add);
router.get(
  "/admin/dataAnalysisModelModView",
  userController(),
  admin_new_auth.output.add
);

router.get('/model_updated', new_auth.output.manage_status)


//Dataset
router.get("/ds/insert", ds.output.insert);
router.get("/ds/getNsVer/:id", ds.output.getNsVer);
router.get("/ds/duplication/check/:checkId", ds.output.dupCheck);
router.get("/ds/list", paginate.middleware(10, 50), ds.output.list);
router.get("/ds/list/:page", paginate.middleware(10, 50), ds.output.list);
router.get("/ds/view/:ds_id", ds.output.view);
router.get("/ds/edit/:ds_id", ds.output.edit);
//Dataflow
router.get("/df/insert", df.output.insert);
router.get("/df/list", paginate.middleware(10, 50), df.output.list);
router.get("/df/list/:page", paginate.middleware(10, 50), df.output.list);
router.get("/df/view/:df_id", df.output.view);

//==============================POST======================================

//Dashboard
router.post("/dashboard/register", dash.process.register);
//Analysis
router.post("/analysis/insert", newAnaly.process.insert);
//Model
router.post(
  "/model/file_add",
  uploadFile.single("atch_origin_file_name"),
  new_auth.process.file_add
);
router.post(
  "/model/register/complete",
  uploadFile.single("atch_origin_file_name"),
  new_auth.process.register_complete
);
router.post("/model/list/delete", new_auth.process.delete);
router.post(
  "/admin/model/list/delete",
  userController(),
  admin_new_auth.process.delete
);

//Dataset
router.post("/ds/inserted", ds.process.insert);
//Dataset flow
router.post("/df/inserted", df.process.insert);

//===============================PUT======================================
//Analysis
router.put("/analysis/softDel/:al_id", newAnaly.process.softDelOne);
router.put("/analysis/softListDelete", newAnaly.process.softDelList);
router.put("/analysis/edited/:al_id", newAnaly.process.edit);

// Models
router.put(
  "/model/dataAnalysisModelModView/edit",
  uploadFile.single("atch_origin_file_name"),
  new_auth.process.edit
);

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

//==============================OLD======================================
// router.put("/model_manage_board/:md_id", auth.process.edit);
// router.post("/dataAnalysisModelmodView", new_auth.process.status_update);
// router.post("/model_manage_board", auth.process.status_update);
// router.post("/model/register", auth.process.register_init);
// router.post('/model/list/delete', auth.process.delete)
// router.post('/model/file_add',uploadFile.single("atch_origin_file_name"), auth.process.file_add)
// router.post('/model/register/complete', uploadFile.single("atch_origin_file_name"), auth.process.register_complete)
// router.post('/model/register/edit', uploadFile.single("atch_origin_file_name"), auth.process.register_edit)
// router.post('/model/redirect/edit', auth.process.edit_redirect)
// router.get("/model_manage_board/:md_id", new_auth.output.manage_status);
// router.get('/model_manage_board/edit/:md_id', auth.output.register_edit)
// router.get("/model_manage_board",paginate.middleware(10, 50), auth.output.manage_board);
// router.get("/model_manage_board/:md_id", auth.output.manage_status);
// router.get("/model_register_board", auth.output.model_register_board);
// router.get('/model_registered_show/:md_id', auth.output.registered_show);
//router.get('/dashboard/processed_data_load', dash.output.processed_data_load)
