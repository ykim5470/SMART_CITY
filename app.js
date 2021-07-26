const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const models = require("./models/index");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const socket = require("socket.io");
const axios = require("axios");
const {
  analysis_list,
  column_tb,
  model_list,
  model_input,
} = require("./models");
const {
  my_scheduleJob,
  start_end_time_generator,
  options,
  sorted_input_param,
  single_processed_data,
} = require("./public/js/helpers/api_scheduler");
const moment = require("moment");

//routers
const index_router = require("./routes/index");

// models.sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("DB connected");
//   })
//   .catch((err) => {
//     console.log(`DB connection fail: ${err}`);
//   });

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use("/", index_router);

const server = app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});

// Socket setup
const io = socket(server, {
  allowEIO3: true, // false by default
});

// Socket Global Variables
let data_selection_obj = new Object();
let al_name_mo_obj = new Object();

// Socket Connection
io.on("connection", function (socket) {
  console.log("Made socket connection");

  // 스케쥴러 조작
  socket.on("모델 스케쥴러 조작", (data) => {
    const { status, md_id } = data;
    // 선택 모델 정보 GET
    model_list
      .findOne({
        where: { md_id: md_id },
        attributes: [
          "al_time",
          "sub_data",
          "date_look_up",
          "data_processing_option",
        ],
      })
      .then((res) => {
        // 선택 모델 인풋 정보 GET
        model_input
          .findAll({
            where: { md_id: md_id },
            attributes: ["ip_param", "ip_value", "ip_load"],
          })
          .then((user_input_res) => {
            // 선택 모델 정보 & 인풋 정보 JSON
            const user_input_str = JSON.stringify(user_input_res);
            const user_input_value = JSON.parse(user_input_str);
            const user_input_value_count = user_input_value.length;
            const model_manage_str = JSON.stringify(res);
            const model_manage_value = JSON.parse(model_manage_str);
            const data_load_limit = new Array();
            user_input_value.map((el) => data_load_limit.push(el.ip_load));
            const max_load = Math.max(...data_load_limit);

            const { al_time, sub_data, date_look_up, data_processing_option } =
              model_manage_value;

            // 데이터 개별 이력조회 API 쿼리 변수
            let date = new Date();
            let end_time = moment(date).format();
            let parsed_date_look_up = JSON.parse(date_look_up);
            let start_time = start_end_time_generator(
              parsed_date_look_up,
              end_time
            );

            // API request Scheduler callback function
            const raw_data_sub_get = async () => {
              var sub_data_list = JSON.parse(sub_data);
              // 단일 센서 데이터 선택 시
              if (typeof sub_data_list == "string") {
                // 단일 센서 데이터 GET
                await axios
                  .get(
                    `http://203.253.128.184:18227/temporal/entities/${sub_data_list.slice(
                      0,
                      -1
                    )}?timerel=between&time=2020-06-01T00:00:00+09:00&endtime=2021-08-01T00:00:00+09:00&limit=${max_load}&lastN=${max_load}&timeproperty=modifiedAt`,
                    { headers: { Accept: "application/json" } }
                  )
                  .then((result) => {
                    var raw_data_bundle = result.data;
                    // 인풋 attr 순서 재배치 by value
                    var sorted_input_param_result =
                      sorted_input_param(user_input_value);

                    // Mapped 데이터
                    var single_processed_data_result = single_processed_data(
                      user_input_value_count,
                      sorted_input_param_result,
                      raw_data_bundle,
                      user_input_value
                    );
                    console.log(single_processed_data_result);
                    return single_processed_data_result;
                  });
              } else {
                // 다중 센서 데이터 선택 시
                // 다중 센서 데이터 GET by Promise
                let pre_processed_data = sub_data_list.map(
                  async (el, index) => {
                    let multiple_processing_data = await axios
                      .get(
                        `http://203.253.128.184:18227/temporal/entities/${el.slice(
                          0,
                          -1
                        )}?timerel=between&time=2020-06-01T00:00:00+09:00&endtime=2021-08-01T00:00:00+09:00&limit=${max_load}&lastN=${max_load}&timeproperty=modifiedAt`,
                        { headers: { Accept: "application/json" } }
                      )
                      .then((result) => {
                        var raw_data_bundle = result.data; // 데이터 번들
                        // 인풋 attr 순서 재배치 by value
                        var sorted_input_param_result =
                          sorted_input_param(user_input_value);

                        // Mapped 데이터
                        var single_processed_data_result =
                          single_processed_data(
                            user_input_value_count,
                            sorted_input_param_result,
                            raw_data_bundle,
                            user_input_value
                          );
                        return single_processed_data_result;
                      });
                    return multiple_processing_data;
                  }
                );

                // 다중 센서 데이터 Promise
                // pre_processed_data // [ Promise { <pending> }, Promise { <pending> } ]
                var processed_data = options(
                  data_processing_option,
                  pre_processed_data
                );

                // 옵션 적용된 다중 센서 데이터 Promise
                // processed_data
                // processed_data.then(test => console.log(test))
              }
            };
            // scheduler modules
            var is_running = status == "running" ? true : false;
            var cron_expression = `*/${al_time} * * * * *`;

            my_scheduleJob(
              md_id,
              "Etc/UTC",
              cron_expression,
              raw_data_sub_get,
              is_running
            );
          });
      });
  });

  // 데이터 셋 선택
  socket.on("데이터 선택", (data) => {
    const { dataset_info } = data;

    data_selection_obj = { ...data };
    // 선택 된 데이터 개별 센서 데이터 API calling;
    const sub_data_get = async () => {
      const sub_data_queries = dataset_info.split(",");
      const sub_data_attr = ["id", "type", "name", "version"];
      const attr_obj = Object.fromEntries(
        sub_data_attr.map((key, index) => [key, sub_data_queries[index]])
      );
      const sub_data = await axios
        .get(
          `http://203.253.128.184:18227/entities?Type=${attr_obj.name}.${attr_obj.type}:${attr_obj.version}&datasetId=${attr_obj.id}`,
          { headers: { Accept: "application/json" } }
        )
        .then((res) => {
          return res.data;
        });
      return sub_data;
    };
    sub_data_get().then((res) => {
      socket.emit("데이터 선택 완료 및 개별 센서 데이터 calling", res);
    });

    // 선택 된 데이터 API calling; attributes GET
    const attr_get = async () => {
      const input_queries = dataset_info.split(",");
      const input_attr = ["id", "type", "name", "version"];
      const attr_obj = Object.fromEntries(
        input_attr.map((key, index) => [key, input_queries[index]])
      );
      const input_items = await axios
        .get(
          `http://203.253.128.184:18827/datamodels/${attr_obj.name}/${attr_obj.type}/${attr_obj.version}`,
          { headers: { Accept: "application/json" } }
        )
        .then((res) => {
          return res.data;
        });
      return input_items;
    };
    attr_get().then((res) => {
      socket.emit("데이터 선택 완료 및 인풋 calling", res.attributes);
    });
  });

  // 선택 된 분석 모델 API calling; attributes GET
  socket.on("분석 모델 선택", (data) => {
    const { al_name_mo } = data;
    al_name_mo_obj = { al_name_mo };

    const analysis_output = async () => {
      const analysis_column = await analysis_list
        .findOne({ where: { type: al_name_mo } })
        .then((res) => {
          const al_list_str = JSON.stringify(res);
          const al_list_value = JSON.parse(al_list_str);
          const al_id = al_list_value.al_id;
          const column_attr = column_tb
            .findAll({ where: { al_id_col: al_id } })
            .then((result) => {
              const column_str = JSON.stringify(result);
              const column_value = JSON.parse(column_str);
              return column_value;
            });
          return column_attr;
        });
      return analysis_column;
    };
    analysis_output().then((res) => {
      socket.emit("분석 모델 선택 완료 및 아웃풋 calling", res);
    });
  });

  // 테스트
  axios
    .get(
      "http://203.253.128.184:18227/temporal/entities/urn:waterdna:WaterPumpStation_100?timerel=between&time=2020-06-01T00:00:00+09:00&endtime=2021-08-01T00:00:00+09:00&limit=25&lastN=25&timeproperty=modifiedAt",
      { headers: { Accept: "application/json" } }
    )
    .then((result) => {
      socket.emit("테스트 API", result.data);
    });
});
