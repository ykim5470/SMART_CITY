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
  get_dataset: async (value) => {
    const dataset = await axios.get("http://203.253.128.184:18827/datasets", {
      headers: { Accept: "application/json" },
    });
    const dataset_dict = [];
    dataset.data.filter((el) => {
      if (value === "raw_data" && el.isProcessed === "원천데이터") {
        dataset_dict.push({
          key: el.name,
          value: {
            id: el.id,
            dataModelType: el.dataModelType,
            dataModelNamespace: el.dataModelNamespace,
            dataModelVersion: el.dataModelVersion,
          },
        });
      } else if (value === "processed_data" && el.isProcessed !== "원천데이터") {
        dataset_dict.push({
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
  check_data: async (dataset) => {
    for (var i = 0; i < dataset.length; i++) {
      let uri = `Type=${dataset[i].value.dataModelNamespace}.${dataset[i].value.dataModelType}:${dataset[i].value.dataModelVersion}&datasetId=${dataset[i].value.id}`;
      console.log(uri)
      try {
        await axios.get(`http://203.253.128.184:18227/entities?${uri}`, {
          headers: { Accept: "application/json" },
        });
      } catch (err) {
        console.log(uri)
        dataset.splice(i, 1);
        i--;
        continue;
      }
    }
    return dataset;
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
      const loaded_data = await output.get_dataset(selected_value);
      //const has_data = await output.check_data(loaded_data);
      return res.send({ data: loaded_data });
    } catch (err) {
      console.log(err);
      return;
    }
  },
  // 대시보드 데이터 GET
  data_load: async (req, res) => {
    const defineUri = req.params.data;
    const data_dict = [];
    const alert = "<script>alert('해당 dataset에 적재된 data가 존재하지 않습니다.'); location.href=history.back();</script>";
    try {
      const dataList = await axios.get(`http://203.253.128.184:18227/entities?${defineUri}`, {
        headers: { Accept: "application/json" },
      });
      dataList.data.filter((el) => {
        return data_dict.push(el.name);
      });
      return res.send({ data: data_dict });
    } catch (err) {
      res.send(alert)
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
