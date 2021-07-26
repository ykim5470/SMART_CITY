const {
  model_list,
  model_output,
  model_des,
  model_input,
  atch_file_tb,
  analysis_list,
  dataset,
} = require("../models");
const axios = require("axios");
const analysis = require("./newAnaly.js");
const moment = require("moment");
const Path = require("path");
const fs = require("fs");
const exec = require("child_process");
const unzipper = require("unzipper");
const errorHandling = require("../public/js/helpers/error_handling");
const {
  INGEST_INTERFACE,
  DATA_MANAGER,
  DATA_SERVICE_BROKER,
} = require("../base");
// const { readdirSync } = require("fs");
const { resolve } = require("path");

// Get
const output = {
  // 대시보드
  dashboard: async (req, res) => {
    axios
      .get(
        "http://203.253.128.184:18227/temporal/entities/urn:waterdna:WaterPumpStation_100?timerel=between&time=2020-06-01T00:00:00+09:00&endtime=2021-08-01T00:00:00+09:00&limit=25&lastN=25&timeproperty=modifiedAt",
        { headers: { Accept: "application/json" } }
      )
      .then((result) => {
        const variable1 = result.data.energyConsumption
        const variable2 = result.data.IntakeVolume
        console.log(variable1)
        res.render("dashboard/dashboard.html");
      });
  },
  // 모델 관리 보드
  manage_board: async (req, res) => {
    try {
      const currentPage = req.query.page; // 현재 페이지
      const temp = req.url; //현재 경로
      let offset = 0;
      if (currentPage > 1) {
        offset = 10 * (currentPage - 1);
      }
      await model_list
        .findAndCountAll({
          limit: req.query.limit,
          offset: offset,
          attributes: {
            exclude: ["updatedAt"],
          },
        })
        .then((result) => {
          const itemCount = result.count; //총 게시글 갯수
          const pageCount = Math.ceil(itemCount / req.query.limit); //페이지 갯수
          const base = "model_manage_board"; // base url
          const pageArray = analysis.paging.makeArray(
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
          return res.render(`model/model_manage_board`, {
            list_data: result.rows,
            pages: pageArray,
            nextUrl: hasMore,
            prevUrl: hasprev,
          });
        });
    } catch (err) {
      return res.status(500).json({
        error: "SQL query error",
      });
    }
  },

  // 원천 데이터셋 선택
  raw_dataset_select: async () => {
    const dataset = await axios.get("http://203.253.128.184:18827/datasets", {
      headers: { Accept: "application/json" },
    });
    const dataset_dict = [];
    dataset.data.filter((el) => {
      if (el.isProcessed === "원천데이터") {
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
  },

  // 실측 데이터 API GET; 최종값 조회 or 개별 이력 조회에 따라 API url 변경 예정
  raw_data_get: async (type, namespace, version, dataset_id) => {
    await axios
      .get(
        `${DATA_SERVICE_BROKER}/entities?Type=${type}.${namespace}:${version}&datasetId=${dataset_id}`,
        { headers: { Accept: "application/json" } }
      )
      .then((rawData) => {});
  },

  // 모델 상태 관리
  manage_status: (req, res) => {
    const { status } = req.query;
    const { md_id } = req.params;
    return res.render("model/model_status", {
      current_status: status,
      md_id: md_id,
    });
  },

  // 등록 수정
  register_edit: (req, res) => {
    // 등록 된 md_id GET
    const md_id = req.params.md_id;
    // 등록 된 모델 정보 GET
    model_list
      .findAll({
        attributes: {
          exclude: ["updatedAt", "createdAt"],
        },
        where: { md_id: md_id },
        include: [
          { model: model_des, required: false, attributes: ["des_text"] },
          {
            model: atch_file_tb,
            required: false,
            attributes: ["originalname"],
          },
          { model: analysis_list, required: false, attributes: ["context"] },
        ],
        raw: true,
      })
      .then((result) => {
        // 등록 된 모델 정보 변수 설정
        const model_edit_str = JSON.stringify(result);
        const model_edit_value = JSON.parse(model_edit_str)[0];
        const { al_time, al_name_mo, dataset_id, data_model_name } =
          model_edit_value;
        let al_time_prev = al_time;
        let al_name_mo_prev = al_name_mo;
        let dataset_id_prev = dataset_id;
        let raw_data_model_name_prev = data_model_name;
        let md_desc_prev = model_edit_value["model_des.des_text"];
        let file_name_prev = model_edit_value["atch_file_tb.originalname"];
        let processed_dataset_edit = new Array();
        let processed_dataset_edit_removed = new Array();
        let raw_data_model_key_prev;
        let processed_selected_name;

        // 유저 인풋 값 GET
        model_input
          .findAll({
            where: { md_id: md_id },
            attirbutes: ["ip_param", "ip_value"],
          })
          .then((results) => {
            const model_input_info_str = JSON.stringify(results);
            const model_input_info_value = JSON.parse(model_input_info_str);

            // 등록 된 원천 데이터 셋 이름 GET
            const raw_dataset_name_edit = output.raw_dataset_select();
            raw_dataset_name_edit.then((dataset_name_result) => {
              dataset_name_result.filter((el) => {
                if (el.value.id === raw_data_model_name_prev.split(",")[0]) {
                  raw_data_model_key_prev = el;
                }
              });
              // 등록 된 가공 데이터 셋 이름 GET
              dataset
                .findAll({
                  where: { ds_delYn: "N" },
                  attributes: {
                    exclude: ["updatedAt", "createdAt"],
                    include: [
                      {
                        model: analysis_list,
                        required: false,
                        attributes: ["type"],
                      },
                    ],
                    raw: true,
                  },
                })
                .then((result_edit) => {
                  const processed_str_edit = JSON.stringify(result_edit);
                  const processed_value_edit = JSON.parse(processed_str_edit);
                  processed_value_edit.map((el) => {
                    if (el.isProcessed != "원천데이터") {
                      processed_dataset_edit.push(el);
                    }
                  });

                  // 가공 데이터 중 선택된 데이터 셋 이름 GET
                  processed_dataset_edit.filter((el) => {
                    if (el.dataset_id == dataset_id_prev) {
                      processed_selected_name = el.name;
                    } else {
                      processed_dataset_edit_removed.push(el);
                    }
                  });

                  return res.render(`model/model_register_board_edit`, {
                    md_id: md_id,
                    al_time: al_time_prev,
                    processed_dataset_edit_removed:
                      processed_dataset_edit_removed,
                    raw_data_model_key_prev: raw_data_model_key_prev,
                    md_desc: md_desc_prev,
                    data_model_name: raw_data_model_name_prev,
                    model_input_info_value: model_input_info_value,
                    file_name_prev: file_name_prev,
                    al_name_mo_prev: al_name_mo_prev,
                    processed_selected_name: processed_selected_name,
                    dataset_id_prev: dataset_id_prev,
                  });
                });
            });
          });
      });
  },

  // 등록된 모델 보기
  registered_show: (req, res) => {
    // 등록 된 md_id GET
    const md_id = req.params.md_id;
    // 등록 된 모델 정보 GET
    model_list
      .findAll({
        attributes: {
          exclude: ["updatedAt", "createdAt"],
        },
        where: { md_id: md_id },
        include: [
          { model: model_des, required: false, attributes: ["des_text"] },
          {
            model: atch_file_tb,
            required: false,
            attributes: ["originalname"],
          },
          { model: analysis_list, required: false, attributes: ["context"] },
        ],
        raw: true,
      })
      .then((result) => {
        // 등록 된 모델 정보 변수 설정
        const model_edit_str = JSON.stringify(result);
        const model_edit_value = JSON.parse(model_edit_str)[0];
        const {
          md_name,
          al_time,
          al_name_mo,
          dataset_id,
          data_model_name,
          date_look_up,
        } = model_edit_value;
        console.log(model_edit_value);
        let date_look_up_prev = Object.values(JSON.parse(date_look_up));
        let md_name_prev = md_name;
        let al_time_prev = al_time;
        let al_name_mo_prev = al_name_mo;
        let dataset_id_prev = dataset_id;
        let raw_data_model_name_prev = data_model_name;
        let md_desc_prev = model_edit_value["model_des.des_text"];
        let file_name_prev = model_edit_value["atch_file_tb.originalname"];
        let processed_dataset_edit = new Array();
        let processed_dataset_edit_removed = new Array();
        let raw_data_model_key_prev;
        let processed_selected_name;

        // 유저 인풋 값 GET
        model_input
          .findAll({
            where: { md_id: md_id },
            attirbutes: ["ip_param", "ip_value"],
          })
          .then((results) => {
            const model_input_info_str = JSON.stringify(results);
            const model_input_info_value = JSON.parse(model_input_info_str);

            // 등록 된 원천 데이터 셋 이름 GET
            const raw_dataset_name_edit = output.raw_dataset_select();
            raw_dataset_name_edit.then((dataset_name_result) => {
              dataset_name_result.filter((el) => {
                if (el.value.id === raw_data_model_name_prev.split(",")[0]) {
                  raw_data_model_key_prev = el;
                }
              });

              // 등록 된 가공 데이터 셋 이름 GET
              dataset
                .findAll({
                  where: { ds_delYn: "N" },
                  attributes: {
                    exclude: ["updatedAt", "createdAt"],
                  },
                  include: [
                    {
                      model: analysis_list,
                      required: false,
                      attributes: ["name"],
                    },
                  ],
                  raw: true,
                })
                .then((result_edit) => {
                  const processed_str_edit = JSON.stringify(result_edit);
                  const processed_value_edit = JSON.parse(processed_str_edit);
                  processed_value_edit.map((el) => {
                    if (el.isProcessed != "원천데이터") {
                      processed_dataset_edit.push(el);
                    }
                  });

                  // 가공 데이터 중 선택된 데이터 셋 이름 GET
                  processed_dataset_edit.filter((el) => {
                    if (el.dataset_id == dataset_id_prev) {
                      processed_selected_name = el.name;
                    } else {
                      processed_dataset_edit_removed.push(el);
                    }
                  });

                  return res.render(`model/model_registered_show`, {
                    md_id: md_id,
                    md_name: md_name_prev,
                    al_time: al_time_prev,
                    date_look_up: date_look_up_prev,
                    processed_dataset_edit_removed:
                      processed_dataset_edit_removed,
                    raw_data_model_key_prev: raw_data_model_key_prev,
                    md_desc: md_desc_prev,
                    data_model_name: raw_data_model_name_prev,
                    model_input_info_value: model_input_info_value,
                    file_name_prev: file_name_prev,
                    al_name_mo_prev: al_name_mo_prev,
                    processed_selected_name: processed_selected_name,
                  });
                });
            });
          });
      });
  },

  // 모델 등록 보드
  model_register_board: async (req, res) => {
    try {
      await dataset
        .findAll({
          where: { ds_delYn: "N" },
          attributes: {
            exclude: ["updatedAt", "createdAt"],
          },
          include: [
            { model: analysis_list, required: false, attributes: ["type"] },
          ],
          raw: true,
        })
        .then((result) => {
          const processed_str = JSON.stringify(result);
          const processed_value = JSON.parse(processed_str);
          const processed_dataset = new Array();
          let newValue = new Array();
          processed_value.map((el) => {
            if (el.isProcessed != "원천데이터") {
              processed_dataset.push(el);
            }
          });
          processed_dataset.map((el) => {
            newValue.push({ al_name: el["analysis_list.type"] });
          });
          const raw_dataset_name = output.raw_dataset_select();
          raw_dataset_name.then((result) => {
            res.render(`model/model_register_board`, {
              processed_dataset: processed_dataset,
              raw_dataset_name: result,
              input_items: [],
            });
          });
        });
    } catch (err) {
      return res.status(500).json({
        error: "Something went wrong",
      });
    }
  },
};

// Post
const process = {
  // 파일 TB Create
  file_add: async (req, res) => {
    const { originalname, mimetype, path, filename } = req.file;
    await atch_file_tb.create({
      originalname,
      mimetype,
      path,
      filename,
    });

    var uploadedFileDirectory = Path.resolve(__dirname, "../uploads/").replace(
      /\\/g,
      "/"
    ); //업로드 되는 파일 경로
    var ExtractedFileDirectory = Path.resolve(
      __dirname,
      "../uploads/model/"
    ).replace(/\\/g, "/"); // 압축 해제시 파일 경로
    let extractedmodel = Path.resolve(
      ExtractedFileDirectory + "/" + originalname.split(".")[0]
    ).replace(/\\/g, "/"); // 압축 해제 서브 폴더 이름

    // protocol buffer TF saved 모델을 업로드 했을 경우 JSON처리
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
    // h5 모델을 업로드 했을 경우 JSON처리
    if (
      mimetype == "application/octet-stream" &&
      originalname.split(".")[1] == "h5"
    ) {
      console.log(ExtractedFileDirectory + "/" + filename);
      exec.exec(
        `tensorflowjs_converter --input_format=keras ${uploadedFileDirectory}/${filename} ${ExtractedFileDirectory}/${filename}`
      );
      return;
    }
    return;
  },

  // 모델 등록 Complete
  register_complete: async (req, res) => {
    const {
      md_name,
      al_name_mo,
      al_time,
      dataset_id,
      model_desc,
      ip_attr_name,
      user_input_param,
      ip_attr_value_type,
      sub_data_select,
      data_lookup_date,
      data_lookup_hour,
      data_lookup_min,
      data_lookup_sec,
      max_data_load,
      max_data_load_index,
      data_processing,
    } = req.body;
    // Error handling from server
    try {
      errorHandling.al_time_handling(al_time); // 3600
      errorHandling.dataset_handling(dataset_id); // dataset_0625,now test,kr.citydatahub,2.0
      errorHandling.input_param_handling(user_input_param); // ['유량','','','','','',''] or ''
      errorHandling.al_name_mo_handling(al_name_mo); // lewis-dataset111
      errorHandling.file_upload_handling(req.file); // {file_name: '', mimtype: '', etc}
      errorHandling.data_look_up_handling(
        data_lookup_date,
        data_lookup_hour,
        data_lookup_min,
        data_lookup_sec
      );
      errorHandling.max_data_load_handling(max_data_load); // limit 48, 5, 2
      errorHandling.data_processing_option_handling(
        sub_data_select,
        data_processing
      );
      let date_look_up = {
        date: data_lookup_date,
        hour: data_lookup_hour,
        min: data_lookup_min,
        sec: data_lookup_sec,
      };
      let al_id;
      let file_id;
      let md_id;
      let user_obj = new Object();

      // 파일 TB Create
      await process.file_add(req, res);
      // 분석 모델 TB al_id GET
      await analysis_list
        .findOne({ where: { type: al_name_mo.split(",")[0] } })
        .then((res) => {
          const al_list_str = JSON.stringify(res);
          const al_list_value = JSON.parse(al_list_str);
          return (al_id = al_list_value.al_id);
        });

      // 파일 TB file_id GET
      await atch_file_tb
        .findAll({ order: [["createdAt", "DESC"]] })
        .then((res) => {
          const model_from_file = JSON.stringify(res);
          const model_from_file_value = JSON.parse(model_from_file)[0];
          return (file_id = model_from_file_value.file_id);
        });

      // 모델 리스트 TB Create
      await model_list
        .create({
          md_name: md_name,
          file_id: file_id,
          al_time: al_time,
          al_name_mo: al_name_mo.split(",")[0],
          data_model_name: dataset_id,
          al_id: al_id,
          dataset_id: al_name_mo.split(",")[1],
          sub_data: sub_data_select,
          date_look_up: date_look_up,
          data_processing_option: data_processing,
        })
        .then(() => {
          // 생성된 모델 리스트 TB의 md_id GET
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
              // 모델 설명 TB Create
              model_des.create({
                des_id: md_id,
                des_text: model_desc,
              });
              // 인풋 파람 필요 데이터 갯수 정의
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

              // 인풋 파람 TB 생성
              if (typeof user_input_param === "string") {
                [user_input_param].filter((el, index) => {
                  if (el != "" && typeof ip_attr_value_type != "string") {
                    user_obj[ip_attr_name[index]] = [
                      el,
                      ip_attr_value_type[index],
                    ];
                  } else {
                    user_obj[ip_attr_name] = [el, ip_attr_value_type];
                  }
                });
              } else {
                user_input_param.filter((el, index) => {
                  if (el != "") {
                    user_obj[ip_attr_name[index]] = [
                      el,
                      ip_attr_value_type[index],
                      data_load_obj[index],
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
                });
              }
            });
        });
      return res.redirect("/model_manage_board");
    } catch (err) {
      console.log(err);
      return res.send(
        `<script>alert("${err}");location.href=history.back();</script>`
      );
    }
  },

  // 등록 페이지 수정
  register_edit: async (req, res) => {
    const {
      md_id,
      al_name_mo,
      al_time,
      dataset_id,
      model_desc,
      ip_attr_name,
      user_input_param,
      ip_attr_value_type,
    } = req.body;
    try {
      // Error handling from server
      errorHandling.al_time_handling(al_time); // 3600
      errorHandling.dataset_handling(dataset_id); // dataset_0625,now test,kr.citydatahub,2.0
      errorHandling.input_param_handling(user_input_param); // ['유량','','','','','',''] or ''
      errorHandling.al_name_mo_handling(al_name_mo.split(",")[0]); // lewis-dataset111

      let file_id;
      let al_id;
      let user_obj = new Object();

      // 파일 TB file_id GET and update
      await atch_file_tb
        .findOne({ order: [["createdAt", "DESC"]] })
        .then((res) => {
          const model_from_file = JSON.stringify(res);
          const model_from_file_value = JSON.parse(model_from_file);
          file_id = model_from_file_value.file_id;
        });
      await model_list.update(
        { file_id: file_id },
        { where: { md_id: md_id } }
      );

      // 분석 모델 TB al_id GET
      await analysis_list
        .findOne({ where: { type: al_name_mo.split(",")[0] } })
        .then((res) => {
          const al_list_str = JSON.stringify(res);
          const al_list_value = JSON.parse(al_list_str);
          return (al_id = al_list_value.al_id);
        });
      // 모델 리스트 TB 수정
      await model_list.update(
        {
          al_time: al_time,
          al_name_mo: al_name_mo.split(",")[0],
          data_model_name: dataset_id,
          al_id: al_id,
          dataset_id: al_name_mo.split(",")[1],
        },
        { where: { md_id: md_id } }
      );

      // 모델 설명 TB update
      await model_des.update(
        {
          des_id: md_id,
          des_text: model_desc,
        },
        { where: { des_id: md_id } }
      );

      // 인풋 파람 TB update
      if (typeof user_input_param === "string") {
        [user_input_param].filter((el, index) => {
          if (el != "" && typeof ip_attr_value_type != "string") {
            user_obj[ip_attr_name[index]] = [el, ip_attr_value_type[index]];
          } else {
            user_obj[ip_attr_name] = [el, ip_attr_value_type];
          }
        });
      } else {
        user_input_param.filter((el, index) => {
          if (el != "") {
            user_obj[ip_attr_name[index]] = [el, ip_attr_value_type[index]];
          }
        });
      }

      for (i in user_obj) {
        model_input.update(
          {
            md_id: md_id,
            ip_param: i,
            ip_value: user_obj[i][0],
            ip_type: user_obj[i][1],
          },
          { where: { md_id: md_id } }
        );
      }

      return res.redirect("/model_manage_board");
    } catch (err) {
      console.log(err);
      return res.send(
        `<script>alert("${err}");location.href=history.back();</script>`
      );
    }
  },

  // 등록 페이지 이동
  register_init: async (req, res) => {
    res.redirect(`/model_register_board`);
  },

  edit_redirect: (req, res) => {
    const { md_id } = req.body;
    res.redirect(`/model_manage_board/edit/${md_id}`);
  },

  // 모델 상태 관리 선택 페이지 이동
  status_update: async (req, res) => {
    const { md_id } = req.body;
    const selected_model = await model_list
      .findOne({ where: { md_id: md_id } })
      .then((result) => result.run_status);
    return res.redirect(`model_manage_board/${md_id}?status=${selected_model}`);
  },
  // 모델 상태 관리 선택; 실행 Or 중지
  edit: async (req, res) => {
    try {
      const { new_status } = req.body;
      const md_id = req.params.md_id;
      await model_list.update(
        { run_status: new_status },
        { where: { md_id: md_id } }
      );
      return res.redirect("/model_manage_board");
    } catch (err) {
      console.log("model status error");
    }
  },
  // 모델 삭제
  delete: async (req, res) => {
    const delModelList = req.body.delModel.split(",");
    delModelList.map((el) => {
      model_list.destroy({ where: { md_id: el } });
    });
    res.redirect("/model_manage_board");
  },
};

module.exports = {
  output,
  process,
};
