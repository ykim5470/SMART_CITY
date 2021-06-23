const express = require("express");
const { analysis_list, column_tb } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");


const output={};
const process={};


module.exports = {
  output,
  process,
};