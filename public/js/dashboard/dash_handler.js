const axios = require("axios");
const moment = require("moment");
const api_scheduler = require("../helpers/api_scheduler");
const fs = require("fs");
const Path = require("path");
const { widget } = require("../../../models");
const config = require("./config");
const base = require("../../../base");
const dataRequest = {
  getData: async (id, startDate, endDate, limit) => {
    console.log("================Get Data===============");
    try {
      let reqUri = "";
      if (startDate == "none" && endDate == "none") {
        reqUri = `${base.DATA_SERVICE_BROKER}/temporal/entities/${id}?limit=${limit}&lastN=${limit}&timeproperty=observedAt`;
      } else {
        endDate = moment(endDate).format();
        reqUri = `${base.DATA_SERVICE_BROKER}/temporal/entities/${id}?timerel=between&time=${startDate}&endtime=${endDate}&limit=${limit}&lastN=${limit}&timeproperty=observedAt`;
      }
      const result = await axios.get(reqUri, { headers: { Accept: "application/json" } });
      console.log(reqUri);
      console.log("=====================================");
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
    let temp = new Object();
    temp[result.title] = {};
    if (result.dataset_type == "원천데이터") {
      let timeSet = result.time.split("-");
      let time = { date: timeSet[0], hour: timeSet[1], min: timeSet[2], sec: timeSet[3] };
      const endDate = new Date();
      const startDate = api_scheduler.start_end_time_generator(time, endDate);
      temp[result.title][result.data_id] = await dataRequest.getData(result.data_id, startDate, endDate, result.data_limit);
    } else {
      temp[result.title][result.data_id] = await dataRequest.getData(result.data_id, "none", "none", 48);
    }
    // const id_list = result.data_id.split(",");
    // for (var i = 0; i < id_list.length; i++) {
    //   temp[result.title][id_list[i]] = await dataRequest.getData(id_list[i], startDate, endDate, result.data_limit, result.load_attr);
    // }
    temp[result.title]["data_type"] = result.dataset_type;
    temp[result.title]["chart_type"] = result.chart_type;
    temp[result.title]["widgetId"] = result.widget_num;
    temp[result.title]["load_attr"] = result.load_attr.split(",").filter((el)=> el!=="predictedAt"&&el!=="");
    if (result.turn_num != undefined) {
      temp[result.title]["turn_num"] = result.turn_num;
    }
    if (result.plugin != undefined) {
      temp[result.title]["plugin"] = result.plugin;
    }
    console.log(temp);
    socket.emit("registered_data", temp);
  });

  socket.on("widget_onload", async (data) => {
    const charts = await widget.findAll({ where: { widget_delYn: "N", user_id: data }, order: [["createdAt", "desc"]] });
    if (charts.length > 0) {
      const endDate = new Date();
      const req_result = new Object();
      for (var i = 0; i < charts.length; i++) {
        req_result[charts[i].title] = {};
        if (charts[i].dataset_type == "원천데이터") {
          let timeSet = charts[i].time.split("-");
          let time = { date: timeSet[0], hour: timeSet[1], min: timeSet[2], sec: timeSet[3] };
          let startDate = api_scheduler.start_end_time_generator(time, endDate);
          req_result[charts[i].title][charts[i].data_id] = await dataRequest.getData(charts[i].data_id, startDate, endDate, charts[i].data_limit);
        } else {
          req_result[charts[i].title][charts[i].data_id] = await dataRequest.getData(charts[i].data_id, "none", "none", 48);
        }
        // let id_array = charts[i].data_id.split(",");
        // for (var j = 0; j < id_array.length; j++) {
        //   req_result[charts[i].title][id_array[j]] = await dataRequest.getData(id_array[j], startDate, endDate, charts[i].data_limit);
        // }
        req_result[charts[i].title]["data_type"] = charts[i].dataset_type;
        req_result[charts[i].title]["chart_type"] = charts[i].chart_type;
        req_result[charts[i].title]["widgetId"] = charts[i].widget_num;
        req_result[charts[i].title]["load_attr"] = charts[i].load_attr.split(",").filter((el)=> el!=="predictedAt"&&el!=="");
        if (charts[i].turn_num != undefined) {
          req_result[charts[i].title]["turn_num"] = charts[i].turn_num;
        }
        if (charts[i].plugin != undefined) {
          req_result[charts[i].title]["plugin"] = charts[i].plugin;
        }
      }
      console.log(req_result);
      socket.emit("widget_loaded", req_result);
    }
  });
  socket.on("widget_delete", async (data) => {
    await widget.update({ widget_delYn: "Y" }, { where: { widget_num: data } });
  });
};
module.exports = dash_handler;
