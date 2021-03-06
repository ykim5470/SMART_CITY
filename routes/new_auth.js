const {
  model_list,
  model_output,
  model_des,
  model_input,
  atch_file_tb,
  auth,
} = require("../models");
const axios = require("axios");
const paging = require("../public/js/helpers/pagination");
const moment = require("moment");
const Path = require("path");
const fs = require("fs");
const exec = require("child_process");
const unzipper = require("unzipper");
const errorHandling = require("../public/js/helpers/error_handling");
const base = require("../base");
const { resolve } = require("path");
const flatten = require("flat").flatten;

// POST URL
const dataRequest = {
  insert: async (result) => {
    console.log("=======FULL UPSERT REQUEST=======");
    try {
      const res = await axiox({
        method: "post",
        url: `${base.INGEST_INTERFACE}/entityOperations/upsert`,
        data: {
          datasetId: "",
          entities: [],
        },
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  },
  update: async (result) => {
    console.log("=======PARTIAL UPSERT REQUEST=======");
    try {
      const res = await axiox({
        method: "post",
        url: `${base.INGEST_INTERFACE}/entityOperations/upsert?options=update`,
        data: {
          datasetId: "",
          entities: [],
        },
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  },
  delete: async (result) => {
    console.log("=======DELETE UPSERT REQUEST=======");
    try {
      const res = await axiox({
        method: "post",
        url: `${base.INGEST_INTERFACE}/entityOperations/delete`,
        data: {
          datasetId: "",
          entities: [],
        },
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  },
};

const output = {
  // sub_dataset GET
  subDataset: async (data_model_name) => {
    let sub_data_queries = data_model_name.split(",");
    let sub_data_attr = ["id", "type", "name", "version"];
    const attr_obj = Object.fromEntries(
      sub_data_attr.map((key, index) => [key, sub_data_queries[index]])
    );
    return (sub_data_info = await axios
      .get(
        `http://203.253.128.184:18227/entities?Type=${attr_obj.name}.${attr_obj.type}:${attr_obj.version}&datasetId=${attr_obj.id}`,
        { headers: { Accept: "application/json" } }
      )
      .then((res) => {
        return res.data;
      }));
  },

  test1: async (req, res) => {
    // const userId = req.session.userInfo.userId
    // res.cookie("user_id",userId)
    res.render(`dashboard/dashboard`);
  },

  test: async (req, res) => {
    try {
      // const userId = req.session.userInfo.userId;
      // const nickName = req.session.userInfo.nickname;
      const currentPage = req.query.page;
      const temp = req.url;
      let offset = 0;
      if (currentPage > 1) {
        offset = 10 * (currentPage - 1);
      }
      await model_list
        .findAndCountAll({
          where: { soft_delete: "0" },
          limit: req.query.limit,
          offset: offset,
          attributes: {
            exclude: ["updatedAt"],
          },
        })
        .then((result) => {
          const itemCount = result.count; // total posts
          const pageCount = Math.ceil(itemCount / req.query.limit); // per page
          const base = "dataAnalysisModels"; // base url
          const pageArray = paging.makeArray(
            base,
            currentPage,
            pageCount,
            temp
          );
          const hasMore =
            currentPage < pageCount
              ? `${base}?page=${currentPage + 1}&limit=10`
              : `${base}?page=${currentPage}&limit=10`;
          const hasprev =
            currentPage > 1
              ? `${base}?page=${currentPage - 1}&limit=10`
              : `${base}?page=${currentPage}&limit=10`;
          model_list.prototype.dateFormat = (date) =>
            moment(date).format("YYYY.MMM.DD - hh:mm A");
          return res.render(`model/dataAnalysisModels`, {
            is_active: "is-active",
            list_data: result.rows,
            pages: pageArray,
            nextUrl: hasMore,
            prevUrl: hasprev,
            // nickName: nickName,
          });
        });
    } catch (err) {
      console.log(err);
    }
  },

  // ????????? ?????? ?????? ?????????
  list: async (req, res) => {
    try {
      const userId = req.session.userInfo.userId;
      const nickName = req.session.userInfo.nickname;
      const currentPage = req.query.page;
      const temp = req.url;
      let offset = 0;
      if (currentPage > 1) {
        offset = 10 * (currentPage - 1);
      }
      await model_list
        .findAndCountAll({
          where: { user_id: userId, soft_delete: "0" },
          limit: req.query.limit,
          offset: offset,
          attributes: {
            exclude: ["updatedAt"],
          },
        })
        .then((result) => {
          const itemCount = result.count; // total posts
          const pageCount = Math.ceil(itemCount / req.query.limit); // per page
          const base = "dataAnalysisModels"; // base url
          const pageArray = paging.makeArray(
            base,
            currentPage,
            pageCount,
            temp
          );
          const hasMore =
            currentPage < pageCount
              ? `${base}?page=${currentPage + 1}&limit=10`
              : `${base}?page=${currentPage}&limit=10`;
          const hasprev =
            currentPage > 1
              ? `${base}?page=${currentPage - 1}&limit=10`
              : `${base}?page=${currentPage}&limit=10`;
          model_list.prototype.dateFormat = (date) =>
            moment(date).format("YYYY.MMM.DD - hh:mm A");
          return res.render(`model/dataAnalysisModels`, {
            userId: userId,
            is_active: "is-active",
            list_data: result.rows,
            pages: pageArray,
            nextUrl: hasMore,
            prevUrl: hasprev,
            nickName: nickName,
          });
        });
    } catch (err) {
      console.log(err);
    }
  },

  add: async (req, res) => {
    try {
      let userId = req.session.userInfo.userId
      let nickName = req.session.userInfo.nickname;

      var { mode } = req.query;
      if (mode === "add") {
        output.processed_data().then((processed_dataset_resolve) => {
          var processed_dataset = processed_dataset_resolve;
          output.raw_dataset_select().then((raw_dataset_select_resolve) => {
            var raw_dataset_select = raw_dataset_select_resolve;
            res.render("model/dataAnalysisModelModView", {
              processed_dataset: processed_dataset,
              raw_dataset_name: raw_dataset_select,
              userId: userId,
              nickName: nickName
            });
          });
        });
      } else if (mode === "view") {
        // view mode
        const { md_id } = req.query;
        output.processed_data().then((processed_dataset_resolve) => {
          var processed_dataset = processed_dataset_resolve;
          output.raw_dataset_select().then((raw_dataset_select_resolve) => {
            var raw_dataset_select = raw_dataset_select_resolve;
            res.render("model/dataAnalysisModelsView", {
              md_id: md_id,
              processed_dataset: processed_dataset,
              raw_dataset_name: raw_dataset_select,
              userId: userId,
              nickName:nickName
            });
          });
        });
      } else if (mode === "status") {
        // status mode
        output.status(req, res);
      } else {
        throw "Not valid query sent to server";
      }
    } catch (err) {
      console.log(err);
    }
  },

  status: async (req, res) => {
    try {
      const { md_id } = req.query;
      const current_status = await model_list.findOne({
        where: { md_id: md_id },
        attributes: ["run_status"],
      });
      return res.render("model/model_status", {
        md_id: md_id,
        current_status: current_status.run_status,
      });
    } catch (err) {
      console.log(err);
    }
  },


  // ?????? ????????? ??? Object GET
  raw_dataset_select: async (req, res) => {
    try {
      const dataset = await axios.get(`${base.DATA_MANAGER}/datasets`, {
        headers: { Accept: "application/json" },
      });
      const dataset_dict = [];
      dataset.data.filter((el) => {
        if (el.isProcessed === "???????????????") {
          return dataset_dict.push({
            key: el.name,
            value: {
              id: el.id,
              dataModelType: el.dataModelType,
              dataModelNamespace: el.dataModelNamespace,
              dataModelVersion: el.dataModelVersion,
            },
          });
        }
      });
      return dataset_dict;
    } catch (err) {
      console.log(err);
    }
  },

  // ?????? ????????? ??? Data GET
  processed_data: async () => {
    try {
      const dataset = await axios.get(`${base.DATA_MANAGER}/datasets`, {
        headers: { Accept: "application/json" },
      });
      const processed_data = dataset.data.filter((el) => {
        if (el.isProcessed !== "???????????????") {
          return el;
        }
      });
      return processed_data;
    } catch (err) {
      console.log(err);
    }
  },

  // ?????? ?????? ?????? ?????????
  manage_status: async (req, res) => {
    try {
      console.log("?????? ??????");
      const { status_md_id, new_status } = req.query;
      await model_list.update(
        { run_status: new_status },
        { where: { md_id: status_md_id } }
      );

      res.send("<script> window.close(); </script>");
    } catch (err) {
      return res.status(500).json({
        err: "manage board page calling failed",
      });
    }
  },
};

// POST
const process = {
  // ?????? TB CREATE
  file_add: async (req, res) => {
    try {
      const { originalname, mimetype, path, filename } = req.file;
      await atch_file_tb.create({
        originalname,
        mimetype,
        path,
        filename,
      });

      var uploadedFileDirectory = Path.resolve(
        __dirname,
        "../uploads/"
      ).replace(/\\/g, "/"); //????????? ?????? ?????? ??????
      var ExtractedFileDirectory = Path.resolve(
        __dirname,
        "../uploads/model/"
      ).replace(/\\/g, "/"); // ?????? ????????? ?????? ??????
      let extractedmodel = Path.resolve(
        ExtractedFileDirectory + "/" + originalname.split(".")[0]
      ).replace(/\\/g, "/"); // ?????? ?????? ?????? ?????? ??????

      // protocol buffer TF saved ????????? ????????? ?????? ?????? JSON??????
      if (mimetype == "application/x-zip-compressed") {
        await fs
          .createReadStream(uploadedFileDirectory + "/" + filename)
          .pipe(unzipper.Extract({ path: ExtractedFileDirectory }))
          .on("close", () => {
            resolve();
            sub_list = fs.readdirSync(extractedmodel);
            let input_model_path = Path.resolve(
              ExtractedFileDirectory,
              originalname.split(".")[0],
              sub_list[0]
            ).replace(/\\/g, "/");
            let output_model_path = Path.resolve(
              ExtractedFileDirectory,
              filename
            ).replace(/\\/g, "/");
            exec.exec(
              `tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --signature_name=serving_default --saved_model_tags=serve ${input_model_path} ${output_model_path}`
            );
          });
        return;
      }
      // h5 ????????? ????????? ?????? ?????? JSON??????
      if (
        mimetype == "application/octet-stream" &&
        originalname.split(".")[1] == "h5"
      ) {
        console.log("h5 ?????? ??????");
        console.log(ExtractedFileDirectory + "/" + filename);
        exec.exec(
          `tensorflowjs_converter --input_format=keras ${uploadedFileDirectory}/${filename} ${ExtractedFileDirectory}/${filename}`
        );
        return;
      }
      return;
    } catch (err) {
      return res.status(500).json({
        error: "File uploads and converter processing error",
      });
    }
  },

  // ?????? ?????? Complete
  register_complete: async (req, res) => {
    console.log(req.body);
    try {
      const {
        md_name,
        al_name_mo,
        al_time,
        dataset_id,
        model_desc,
        ip_attr_name,
        user_input_order,
        user_input_param,
        ip_attr_value_type,
        sub_data_select,
        data_lookup_date,
        data_lookup_hour,
        data_lookup_min,
        data_lookup_sec,
        op_data_lookup_date,
        op_data_lookup_hour,
        op_data_lookup_min,
        op_data_lookup_sec,
        max_data_load,
        max_data_load_index,
        data_processing,
        analysis_file_format,
        tf_shape,
        tf_shape_index,
        user_output_param,
      } = req.body;
      console.log(req.body);

      const user_id = req.session.userInfo.userId;
      // Error handling from server
      try {
        errorHandling.al_time_handling(al_time); // 3600
        errorHandling.dataset_handling(dataset_id); // dataset_0625,now test,kr.citydatahub,2.0
        errorHandling.input_param_handling(user_input_param); // ['??????','','','','','',''] or ''
        errorHandling.al_name_mo_handling(al_name_mo); // lewis-dataset111
        errorHandling.file_upload_handling(req.file); // {file_name: '', mimtype: '', etc}
        errorHandling.data_look_up_handling(
          data_lookup_date,
          data_lookup_hour,
          data_lookup_min,
          data_lookup_sec
        );
        errorHandling.data_look_up_handling(
          op_data_lookup_date,
          op_data_lookup_hour,
          op_data_lookup_min,
          op_data_lookup_sec
        );
        errorHandling.max_data_load_handling(max_data_load); // limit 48, 5, 2
        errorHandling.data_processing_option_handling(
          sub_data_select,
          data_processing
        );
        errorHandling.tf_shape_handling(
          max_data_load,
          tf_shape,
          analysis_file_format
        );
        let date_look_up = {
          date: data_lookup_date,
          hour: data_lookup_hour,
          min: data_lookup_min,
          sec: data_lookup_sec,
        };

        let file_id;
        let md_id;
        let user_obj = new Object();

        // ?????? TB Create
        await process.file_add(req, res);

        // ?????? TB file_id GET
        await atch_file_tb
          .findAll({ order: [["createdAt", "DESC"]] })
          .then((res) => {
            const model_from_file = JSON.stringify(res);
            const model_from_file_value = JSON.parse(model_from_file)[0];
            return (file_id = model_from_file_value.file_id);
          });

        // ?????? ????????? TB Create
        await model_list
          .create({
            md_name: md_name,
            user_id: user_id,
            file_id: file_id,
            al_time: al_time,
            al_name_mo: al_name_mo.split(",")[0],
            data_model_name: dataset_id,
            sub_data: sub_data_select,
            date_look_up: date_look_up,
            data_processing_option: data_processing,
            analysis_file_format: analysis_file_format,
            processed_model: al_name_mo,
          })
          .then(() => {
            // ????????? ?????? ????????? TB??? md_id GET
            model_list
              .findAll({
                limit: 1,
                where: { al_time: al_time },
                order: [["createdAt", "DESC"]],
              })
              .then(async (res) => {
                let md_id_str = JSON.stringify(res);
                let md_id_value = JSON.parse(md_id_str)[0];
                md_id = md_id_value.md_id;
                // ?????? ?????? TB Create
                model_des.create({
                  des_id: md_id,
                  des_text: model_desc,
                });
                // ?????? ?????? ?????? ????????? ?????? ??????
                let data_load_obj = new Object();
                if (
                  Array.isArray(max_data_load_index) &&
                  Array.isArray(max_data_load)
                ) {
                  max_data_load_index.map((user_index, idx) => {
                    data_load_obj[user_index] = max_data_load[idx];
                  });
                } else if (typeof max_data_load_index == "string") {
                  data_load_obj[max_data_load_index] = max_data_load;
                }
                // ?????? ?????? ?????? ?????? ?????? ??????
                let tf_shape_obj = new Object();
                if (Array.isArray(tf_shape_index) && Array.isArray(tf_shape)) {
                  tf_shape_index.map((user_index, idx) => {
                    tf_shape_obj[user_index] = tf_shape[idx];
                  });
                } else if (typeof tf_shape_index == "string") {
                  tf_shape_obj[tf_shape_index] = tf_shape;
                }

                // ?????? ?????? TB ??????
                if (typeof user_input_param === "string") {
                  [user_input_param].filter((el, index) => {
                    if (el != "" && typeof ip_attr_value_type != "string") {
                      user_obj[ip_attr_name[index]] = [
                        el,
                        ip_attr_value_type[index],
                      ];
                    } else {
                      user_obj[ip_attr_name] = [el, ip_attr_value_type,data_load_obj[0],tf_shape_obj[0],user_input_order];
                    }
                  });
                } else {
                  user_input_param.filter((el, index) => {
                    if (el !== "") {
                      user_obj[ip_attr_name[index]] = [
                        el,
                        ip_attr_value_type[index],
                        data_load_obj[index],
                        tf_shape_obj[index],
                        user_input_order[index],
                      ];
                    }
                  });
                }
                for (i in user_obj) {
                  await model_input.create({
                    md_id: md_id,
                    ip_param: i,
                    ip_value: user_obj[i][0],
                    ip_type: user_obj[i][1],
                    ip_load: user_obj[i][2],
                    ip_param_type: user_obj[i][3],
                    ip_order: user_obj[i][4],
                  });
                }

                // ????????? TB Create
                let op_date_look_up = {
                  date: op_data_lookup_date,
                  hour: op_data_lookup_hour,
                  min: op_data_lookup_min,
                  sec: op_data_lookup_sec,
                };

                model_output.create({
                  op_id: md_id,
                  op_sequence: user_output_param,
                  op_date_look_up: op_date_look_up,
                });
              });
          });
        console.log("?????? ??????");
        return res.redirect("/dataAnalysisModels");
      } catch (err) {
        console.log(err);
        return res.send(
          `<script>alert("${err}");location.href=history.back();</script>`
        );
      }
    } catch (err) {
      console.log(err);
    }
  },
  // ?????? ?????? ?????? ??????; ?????? Or ??????
  // ?????? edit??? ?????? stop. ????????? ??????????????? Redirect??? ?????? ??????. 
  edit: async (req, res) => {
    try {
      // const { md_id } = req.query;
      // const {
      //   md_name,
      //   al_name_mo,
      //   al_time,
      //   dataset_id,
      //   model_desc,
      //   ip_attr_name,
      //   user_input_order,
      //   user_input_param,
      //   ip_attr_value_type,
      //   sub_data_select,
      //   data_lookup_date,
      //   data_lookup_hour,
      //   data_lookup_min,
      //   data_lookup_sec,
      //   max_data_load,
      //   max_data_load_index,
      //   data_processing,
      //   analysis_file_format,
      //   tf_shape_index,
      //   tf_shape,
      // } = req.body;

      // const user_id = req.session.userInfo.userId;
      // errorHandling.al_time_handling(al_time); // 3600
      // errorHandling.dataset_handling(dataset_id); // dataset_0625,now test,kr.citydatahub,2.0
      // errorHandling.input_param_handling(user_input_param); // ['??????','','','','','',''] or ''
      // errorHandling.al_name_mo_handling(al_name_mo); // lewis-dataset111
      // errorHandling.file_upload_handling(req.file); // {file_name: '', mimtype: '', etc}
      // errorHandling.data_look_up_handling(
      //   data_lookup_date,
      //   data_lookup_hour,
      //   data_lookup_min,
      //   data_lookup_sec
      // );
      // // errorHandling.data_look_up_handling(
      // //   op_data_lookup_date,
      // //   op_data_lookup_hour,
      // //   op_data_lookup_min,
      // //   op_data_lookup_sec
      // // );
      // errorHandling.max_data_load_handling(max_data_load); // limit 48, 5, 2
      // // errorHandling.data_processing_option_handling(
      // //   sub_data_select,
      // //   data_processing
      // // );
      // errorHandling.tf_shape_handling(
      //   max_data_load,
      //   tf_shape,
      //   analysis_file_format
      // );

      // let date_look_up = {
      //   date: data_lookup_date,
      //   hour: data_lookup_hour,
      //   min: data_lookup_min,
      //   sec: data_lookup_sec,
      // };

      // let file_id;
      // let user_obj = new Object();

      // // ?????? TB Create
      // await process.file_add(req, res);

      // // ?????? TB file_id GET
      // await atch_file_tb
      //   .findAll({ order: [["createdAt", "DESC"]] })
      //   .then((res) => {
      //     const model_from_file = JSON.stringify(res);
      //     const model_from_file_value = JSON.parse(model_from_file)[0];
      //     return (file_id = model_from_file_value.file_id);
      //   });

      // // ?????? ????????? TB Update
      // await model_list
      //   .update(
      //     {
      //       al_time: al_time,
      //       user_id: user_id,
      //       md_name: md_name,
      //       al_name_mo: al_name_mo.split(",")[0],
      //       file_id: file_id,
      //       data_model_name: dataset_id,
      //       date_look_up: date_look_up,
      //       sub_data: sub_data_select,
      //       data_processing_option: data_processing,
      //       analysis_file_format: analysis_file_format,
      //     },
      //     { where: { md_id: md_id } }
      //   )
      //   .then(async () => {
      //     // ?????? ?????? TB Update
      //     model_des.update(
      //       { des_text: model_desc },
      //       { where: { des_id: md_id } }
      //     );
      //     // ?????? ?????? ?????? ????????? ?????? ??????
      //     let data_load_obj = new Object();
      //     if (
      //       Array.isArray(max_data_load_index) &&
      //       Array.isArray(max_data_load)
      //     ) {
      //       max_data_load_index.map((user_index, idx) => {
      //         data_load_obj[user_index] = max_data_load[idx];
      //       });
      //     } else if (typeof max_data_load_index == "string") {
      //       data_load_obj[max_data_load_index] = max_data_load;
      //     }
      //     // ?????? ?????? ?????? ?????? ?????? ??????
      //     let tf_shape_obj = new Object();
      //     if (Array.isArray(tf_shape_index) && Array.isArray(tf_shape)) {
      //       tf_shape_index.map((user_index, idx) => {
      //         tf_shape_obj[user_index] = tf_shape[idx];
      //       });
      //     } else if (typeof tf_shape_index == "string") {
      //       tf_shape_obj[tf_shape_index] = tf_shape;
      //     }

      //     // ?????? ?????? TB ????????????
      //     if (typeof user_input_param === "string") {
      //       [user_input_param].filter((el, index) => {
      //         if (el != "" && typeof ip_attr_value_type != "string") {
      //           user_obj[ip_attr_name[index]] = [el, ip_attr_value_type[index]];
      //         } else {
      //           user_obj[ip_attr_name] = [el, ip_attr_value_type];
      //         }
      //       });
      //     } else {
      //       user_input_param.filter((el, index) => {
      //         if (el !== "") {
      //           user_obj[ip_attr_name[index]] = [
      //             el,
      //             ip_attr_value_type[index],
      //             data_load_obj[index],
      //             tf_shape_obj[index],
      //             user_input_order[index],
      //           ];
      //         }
      //       });
      //     }
      //     for (i in user_obj) {
      //       await model_input.update(
      //         {
      //           ip_param: i,
      //           ip_value: user_obj[i][0],
      //           ip_type: user_obj[i][1],
      //           ip_load: user_obj[i][2],
      //           ip_param_type: user_obj[i][3],
      //           ip_order: user_obj[i][4],
      //         },
      //         { where: { md_id: md_id } }
      //       );
      //     }
      //   });
      // console.log("?????? ??????");
      return res.redirect("/dataAnalysisModels");
    } catch (err) {
      console.log("model status error");
      console.log(err);
      return res.send(
        `<script>alert("${err}");location.href=history.back();</script>`
      );
    }
  },

  // ?????? ??????
  delete: async (req, res) => {
    const delModelList = req.body.delModel.split(",");
    await delModelList.map((el) => {
      model_list.update({ soft_delete: "1" }, { where: { md_id: el } });
    });
    console.log("????????? ?????? ??????");

    res.redirect("/dataAnalysisModels");
  },
};

module.exports = { output, process };
