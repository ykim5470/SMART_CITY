const { model_list, model_output, model_des, model_input, atch_file_tb, analysis_list, dataset } = require("../models");
const axios = require("axios");
const paging = require("../public/js/helpers/pagination");
const moment = require("moment");
const Path = require("path");
const fs = require("fs");
const exec = require("child_process");
const unzipper = require("unzipper");
const errorHandling = require("../public/js/helpers/error_handling");
const { INGEST_INTERFACE, DATA_MANAGER, DATA_SERVICE_BROKER } = require("../base");
const { resolve } = require("path");

// Get
const output = {
  testtest: async (req, res) => {
    console.log(req);
    try {
      res.send(`dashboard/test`);
    } catch (err) {
      console.log(err);
    }
  },
  // 대시보드 페이지 Rendering
  dashboard: async (req, res) => {
    // console.log(req)
    res.render(`dashboard/dashboard`);
  },
  // 대시보드 데이터 셋 GET
  dataset_load: async (req, res) => {
    try {
      const selected_value = req.params.data;
      const dataset = await axios.get("http://203.253.128.184:18827/datasets", {
        headers: { Accept: "application/json" },
      });
      const dataset_dict = [];
      dataset.data.filter((el) => {
        if (selected_value == "raw_data") {
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
        } else {
          if (el.isProcessed !== "원천데이터") {
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
        }
      });
      return res.send({ data : dataset_dict });
    } catch (err) {
      console.log(err);
      return;
      // err: 'raw data API calling failed'
    }
  },
  // 대시보드 데이터 GET
  data_load: async (req, res) => {
    try {
      const defineUri = req.params.data;
      const dataList = await axios.get(`http://203.253.128.184:18227/entities?${defineUri}`, {
        headers: { Accept: "application/json" },
      });
      const data_dict = [];
      dataList.data.filter((el) => {
          return data_dict.push(el.name)
      });
      return res.send({ data : data_dict });
    } catch (err) {
      console.log(err);
      return;
      // err: 'raw data API calling failed'
    }
  },
};
// Post
const process = {
  test: (req, res) => {
    console.log("aaaa");
    let a = req;
    // a.then(result => console.log(result))
    console.log(a.body.data);
  },
  // 대시보드 차트 등록 Complete
  chart_register_complete: async (req, res) => {
    console.log("차트 등록 완료");
  },
};

module.exports = {
  output,
  process,
};
