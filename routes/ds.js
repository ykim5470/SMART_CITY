const express = require("express");
const { analysis_list, column_tb, dataset } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");

const output = {
  insert: async (req, res) => {
    await analysis_list.findAll({ attributes: ["al_id", "al_name"], where: { al_delYn: "N" } }).then((result) => {
      res.render("dataset/ds_insert", { analy: result });
    });
  },
  getNsVer: async (req, res) => {
    await analysis_list.findOne({ attributes: ["al_ns", "al_version"], where: { al_id: req.params.id } }).then((result) => {
      res.send(result);
    });
  },
};
const process = {
  insert: async (req, res) => {
    const body = req.body;
    const valArr = body.getValue.split(",");
    let temp = [];
    for (var i = 0; i < valArr.length; i++) {
      temp.push(`${valArr[i]}:"${body[valArr[i]]}"`);
    }
    let obj = {};
    temp.map((el) => {
      const b = el.split(":");
      obj[b[0]] = b[1].substr(1, b[1].length - 2);
    });
    await dataset.create(obj).then(async (result) => {
      await dataset
        .findOne({
          attributes: [["dataset_id", "id"],"name","description","updateInterval","category","providerSystem","isProcessed","ownership",
            "keywords","license","providingApiUri","restrictions","datasetExtension","datasetItems","targetRegions","storageRetention","topicRetention",
            "sourceDatasetIds","qualityCheckEnabled","dataIdentifierType","datamodelType","datamodelNamespace","datamodelVersion",
          ],
          where: { ds_id: JSON.parse(result.ds_id) },
        })
        .then((result) => {
          let newValue = [];
          const inRequest = JSON.parse(JSON.stringify(result));
          Object.values(inRequest).map((el, index) => {
            if (el != null) {
              newValue[Object.keys(inRequest)[index]] = inRequest[Object.keys(inRequest)[index]];
            }
          });
          console.log(newValue);
        });
    });
  },
};

module.exports = {
  output,
  process,
};
