const express = require("express");
const { analysis_list, column_tb, dataset } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");
const base = require("../base");
const newAnaly = require("./newAnaly");

//post url
const dataRequest = {
  
};

const output = {
  insert: async (req, res) => {
    await dataset.findAll({ attributes: ["dataset_id" ], where: { ds_delYn: "N" } }).then((result) => {
      res.render("dataset/ds_insert", { analy: result });
    });
  },
};
const process = {
 
};

module.exports = {
  output,
  process,
};
