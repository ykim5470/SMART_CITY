const express = require("express");
const { analysis_list, column_tb } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");



// get
const output = {
  //테이블 등록 화면
  insert: function (req, res) {
    res.render("newAnaly/n_insert");
  },
};



// post
const process = {
  insert: async (req, res) => {
    let body = req.body;
    try {
      console.log(body);
      res.render("newAnaly/n_insert");
      // if (body.tableName && body.description && body.version && body.nameSpace && body.context) {
      //   await analysis_list
      //     .create({
      //       al_name: body.tableName,
      //       al_ns: body.nameSpace,
      //       al_des: body.description,
      //       al_version: body.version,
      //       al_context: body.context,
      //     })
      //     .then((result) => {
      //       console.log("analysis data insert succeed");
      //       const conList = result.al_context.split(",");

      //       res.redirect("/analysis/list");
      //     });
      // } else {
      //   res.render("analysis/al_insert", { blank: "nullPointException" });
      // }
    } catch (err) {
      console.log("data insert failed");
      console.log(err);
    }
  },
};

module.exports = {
  output,
  process,
};
