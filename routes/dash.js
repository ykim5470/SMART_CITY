const { widget } = require("../models");
const axios = require("axios");
const sequelize = require("sequelize");
const paging = require("../public/js/helpers/pagination");
const api_scheduler = require("../public/js/helpers/api_scheduler");
const moment = require("moment");
const base = require("../base");
// const socket = require("socket.io");
const socket = require("socket.io");

// const flatten = require("flat").flatten;
const dataRequest = {
  getData: async (id, startDate, endDate, limit, attr) => {
    console.log("================Get Data===============");
    try {
      endDate = moment(endDate).format();
      const result = await axios.get(`${base.DATA_SERVICE_BROKER}/temporal/entities/${id}?timerel=between&time=2021-08-10T18:04:10+09:00&endtime=2021-10-09T18:04:10+09:00&limit=${limit}&lastN=${limit}&timeproperty=observedAt`, { headers: { Accept: "application/json" } });
      const tt = `${base.DATA_SERVICE_BROKER}/temporal/entities/${id}?timerel=between&time=${startDate}&endtime=${endDate}&limit=${limit}&lastN=${limit}&timeproperty=observedAt`;
      console.log(tt);
      console.log("=================================");
      return result.data;
    } catch (err) {
      console.log(err);
    }
  },
};

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
      try {
        await axios.get(`http://203.253.128.184:18227/entities?${uri}`, {
          headers: { Accept: "application/json" },
        });
      } catch (err) {
        dataset.splice(i, 1);
        i--;
        continue;
      }
    }
    return dataset;
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
    let flag = false;
    try {
      const dataList = await axios.get(`http://203.253.128.184:18227/entities?${defineUri}`, {
        headers: { Accept: "application/json" },
      });
      dataList.data.filter((el) => {
        return data_dict.push(`${el.id}`);
      });
      if (!flag) {
        return res.send({ data: data_dict });
      }
    } catch (err) {
      if (!flag) {
        return res.send({ data: "error" });
      }
    }
  },
  //datamodel attr get
  attr_load: async (req, res) => {
    const uri = req.params.data;
    try {
      const dataList = await axios.get(`http://203.253.128.184:18827/datamodels/?${uri}`, {
        headers: { Accept: "application/json" },
      });
      let data_dict;
      dataList.data.filter((el) => {
        data_dict = el.attributes;
      });
      data_dict.map((el, index) => {
        if (el.name == "name") {
          data_dict.splice(index, 1);
        }
      });
      return res.send({ data: data_dict });
    } catch (err) {
      res.send({ data: "error" });
    }
  },
  treeview: (req, res) => {
    res.render("dashboard/treeTest");
  },
  // 대시보드 페이지 Rendering
  dashboard: async (req, res) => {
    const userId = req.session.userInfo.userId
    // res.cookie("user_id",userId)
    res.render(`dashboard/dashboard`, {userId: userId});
  },
  get_widget: async (req, res) => {
    const charts = await widget.findAll({ where: { widget_delYn: "N" } });
    if (charts.length > 0) {
      const endDate = new Date();
      const req_result = new Array();
      const name_list = new Array();
      for (var i = 0; i < charts.length; i++) {
        let temp = new Object();
        temp[charts[i].title] = {};
        let timeSet = charts[i].time.split("-");
        let time = { date: timeSet[0], hour: timeSet[1], min: timeSet[2], sec: timeSet[3] };
        let startDate = api_scheduler.start_end_time_generator(time, endDate);
        let id_array = charts[i].data_id.split(",");
        let req_attr = charts[i].load_attr.split(",");
        for (var j = 0; j < id_array.length; j++) {
          temp[charts[i].title][id_array[j]] = await dataRequest.getData(id_array[j], startDate, endDate, charts[i].data_limit, req_attr);
        }
        temp[charts[i].title]["data_type"] = charts[i].dataset_type;
        console.log(temp);
        name_list.push(charts[i].title);
        req_result.push(temp);
      }
      console.log(req_result);
      res.send({ widget_data: req_result});
    }
  },
};
// Post
const process = {
  register: async (req, res) => {
    // const body = req.body;
    // //database
    // const dbTime = `${body.time_days}-${body.time_hours}-${body.time_minutes}-${body.time_seconds}`;
    // body["time"] = dbTime;
    // body.data_id = body.data_id.toString();
    // console.log(body.load_attr);
    // body.load_attr = body.load_attr.toString();
    // console.log(body);
    // const result = await widget.create(body);
    // socket.emit("아무거나","되냐");
    //res.redirect("/dashboard");
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
