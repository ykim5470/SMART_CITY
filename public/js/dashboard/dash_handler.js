const axios = require("axios");
const moment = require("moment");
const api_scheduler = require("../helpers/api_scheduler");
const fs = require("fs");
const Path = require("path");
const { widget } = require("../../../models");
class Widget{
    constructor(data){
        this.title = data.title
    }
    sayHi(){
        console.log(this.title)
    }
}
const dash_handler = (socket) => {
  socket.on("widget_register", async (data) => {
    //database
    const dbTime = `${data.time_days}-${data.time_hours}-${data.time_minutes}-${data.time_seconds}`;
    data["time"] = dbTime;
    const result = await widget.create(data);
    console.log(result)
    let test = new Widget(result);
    test.sayHi();
  });
};
module.exports = dash_handler;
