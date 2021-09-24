const axios = require("axios");
const moment = require("moment");
const api_scheduler = require("../helpers/api_scheduler");
const fs = require("fs");
const Path = require("path");
const { widget } = require("../../../models");
const config = require("./config");
const base = require("../../../base");
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
const dash_handler = (socket) => {
  socket.on("widget_register", async (data) => {
    //database
    const dbTime = `${data.time_days}-${data.time_hours}-${data.time_minutes}-${data.time_seconds}`;
    data["time"] = dbTime;
    const result = await widget.create(data);
    const id_list = result.data_id.split(",");
    let temp = new Object();
    temp[result.title] = {};
    let timeSet = result.time.split("-");
    let time = { date: timeSet[0], hour: timeSet[1], min: timeSet[2], sec: timeSet[3] };
    const endDate = new Date();
    const startDate = api_scheduler.start_end_time_generator(time, endDate);
    for (var i = 0; i < id_list.length; i++) {
      temp[result.title][id_list[i]] = await dataRequest.getData(id_list[i], startDate, endDate, result.data_limit, result.load_attr);
    }
    temp[result.title]["data_type"] = result.dataset_type;
    temp[result.title]["chart_type"] = result.chart_type;
    if (result.plugin != undefined) {
      temp[result.title]["plugin"] = result.plugin;
    }
    console.log(temp);
    socket.emit("registered_data", temp);
  });

  socket.on("widget_onload", async (data) => {
    const charts = await widget.findAll({ where: { widget_delYn: "N", user_id: data } });
    if (charts.length > 0) {
      // const endDate = moment(new Date()).format(); 이거 윤호님께 말씀드리기 이렇게 하니까 날짜가 뒤죽박죽 현재 시간이 10 월이 되고 미래가 되네욥
      const endDate = new Date();
      const req_result = new Object();
      const name_list = new Array();
      for (var i = 0; i < charts.length; i++) {
        req_result[charts[i].title] = {};
        let timeSet = charts[i].time.split("-");
        let time = { date: timeSet[0], hour: timeSet[1], min: timeSet[2], sec: timeSet[3] };
        let startDate = api_scheduler.start_end_time_generator(time, endDate);
        let id_array = charts[i].data_id.split(",");
        let req_attr = charts[i].load_attr.split(",");
        for (var j = 0; j < id_array.length; j++) {
          req_result[charts[i].title][id_array[j]] = await dataRequest.getData(id_array[j], startDate, endDate, charts[i].data_limit, req_attr);
        }
        req_result[charts[i].title]["data_type"] = charts[i].dataset_type;
        req_result[charts[i].title]["chart_type"] = charts[i].chart_type;
        if (charts[i].plugin != undefined) {
          req_result[charts[i].title]["plugin"] = charts[i].plugin;
        }
        name_list.push(charts[i].title);
      }
      console.log(req_result);
      socket.emit("widget_loaded", req_result);
    }
  });
};
module.exports = dash_handler;
