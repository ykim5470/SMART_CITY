const axios = require("axios");
const moment = require("moment");
const { model_list, model_input, atch_file_tb } = require("../../../models");
const {
  my_scheduleJob,
  start_end_time_generator,
  options,
  sorted_input_param,
  single_processed_data,
} = require("../helpers/api_scheduler");
const tensor_shape_convert = require('../helpers/tensor_shape_convert')
const fs = require("fs");
const Path = require("path");

const model_scheduler = (socket) => {
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
          "file_id",
          "analysis_file_format",
        ],
      })
      .then((res) => {
        // 선택 모델 인풋 정보 GET
        model_input
          .findAll({
            where: { md_id: md_id },
            attributes: ["ip_param", "ip_value", "ip_load",'ip_param_type'],
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

            const {
              al_time,
              sub_data,
              date_look_up,
              data_processing_option,
              file_id,
              analysis_file_format,
            } = model_manage_value;


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
                    // 변환된 데이터 분석 파일 GET 및 변환 zip파일 Search
                    atch_file_tb
                      .findAll({
                        where: { file_id: file_id },
                        attributes: ["filename"],
                      })
                      .then((file_meta_data) => {
                        const file_meta_data_str =
                          JSON.stringify(file_meta_data);
                        const file_meta_data_value =
                          JSON.parse(file_meta_data_str);
                        const { filename } = file_meta_data_value[0];

                        var target_dir = Path.resolve(
                          __dirname,
                          "../../../uploads/model/"
                        ).replace(/\\/g, "/");

                        try {
                          // 변환된 파일이 존재한다면 데이터 값 loading실행
                          console.log(
                            `${target_dir}/${filename}/model.json`
                          );
                          if (
                            fs.existsSync(
                              `${target_dir}/${filename}`
                          )) {
                            console.log(analysis_file_format);
                            console.log('실행되는감????')
                            let url = `http://localhost:4000/uploads/model/${filename}/model.json`
                            tensor_shape_convert(analysis_file_format, single_processed_data_result, user_input_value, url)
                        
                          } else {
                            throw "존재하지 않는 변환 파일입니다";
                          }
                        } catch (err) {
                          console.log(err);
                        }
                      });

                    console.log(single_processed_data_result)
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
};

module.exports = model_scheduler;
