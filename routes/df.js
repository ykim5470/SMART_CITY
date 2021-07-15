const express = require("express");
const { analysis_list, column_tb, dataset, dataflow } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");
const base = require("../base");
const newAnaly = require("./newAnaly");

//post url
const dataRequest = {
  insert: async (result) => {
    console.log("========DATASET CREATE REQUEST==========");
    await axios({
      method: "post",
      url: `${base.DATA_MANAGER}/datasets/${result.dataset_id}/flow`,
      data: {
        historyStoreType:result.historyStoreType,
        description : result.description,
        targetType : [
          {
            type : "dataServiceBroker"
          }
        ],
        enable : result.enabled
      },
      headers: { "Content-Type": "application/json" },
    });
  },
};

const output = {
  insert: async (req, res) => {
    await dataset.findAll({ attributes: ["dataset_id"], where: { ds_delYn: "N", ds_setYn:"N" } }).then((result) => {
      res.render("dataflow/df_insert", { df: result });
    });
  },
};
const process = {
  insert: async (req, res) => {
    const body = [req.body];
    let inValue = {};
    try {
      body.map((el) => {
        Object.values(el).filter((item, index) => {
          let key = Object.keys(el)[index];
          if(typeof item != "string"){
            item = item.toString()
          }
          item != "" ? item : (item = null);
          inValue[key] = item;
        });
      });
      await dataflow.create(inValue).then(async (result)=>{
        await dataset.update({ds_setYn : 'Y'},{where:{dataset_id:inValue.dataset_id}})
        dataRequest.insert(result)
        res.redirect("/df/insert");
      })
    } catch (err) {
      console.log("===========================================");
      console.log(err);
    }
  },
};

module.exports = {
  output,
  process,
};
