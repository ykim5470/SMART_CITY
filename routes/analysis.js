const express = require("express");
const models = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;

// Get
const output = {
  plus: function (req, res, next) {
    res.render("analysis/al_insert");
  },
  show: function (req, res, next) {
    models.analysis_list.findAll().then((result) => {
      res.render("analysis/al_list", { anaList: result });
    });
  },
  view: function (req, res, next) {
    let analysisId = req.params.al_id;
    models.analysis_list
      .findOne({
        where: { al_id: analysisId },
      })
      .then((result) => {
        if (result) {
          let ana = result;
          models.column_tb
            .findAll({
              where: { al_id_col: analysisId },
            })
            .then((result) => {
              res.render("analysis/al_view", { analysis: ana, column: result });
            });
        }
      });
  },
  edit: function (req, res, next) {
    let analysisId = req.params.al_id;
    models.analysis_list
      .findOne({
        where: { al_id: analysisId },
      })
      .then((result) => {
        res.render("analysis/al_edit", { analysis: result });
      });
  },
};

// Post , put , delete
const process = {
  insert: async (req, res) => {
    try {
      let body = req.body;
      models.analysis_list
        .create({
          al_name: body.tableName,
          al_ns : body.nameSpace,
          al_des: body.description,
        })
        .then((result) => {
          console.log("analysis data insert succeed");
          axios({
            method: "post",
            url: "http://203.253.128.184:18827/datamodels",
            data: {
              type: result.al_id, // 나중에 al_name으로 수정
              namespace: result.al_ns, 
              version: "1.0",
              context: ["http://uri.etsi.org/ngsi-ld/core-context.jsonld", "http://datahub.kr/test.jsonld"],
              description: result.al_des,
              attributes: [
                {
                  name: "name",
                  isRequired: true,
                  attributeType: "Property",
                  maxLength: 50,
                  valueType: "String",
                },
              ],
            },
            headers: { "Content-Type": "application/json" },
          });
          console.log("id : " + result.al_id);
          res.redirect("/analysis/list");
        })
        .catch((err) => {
          console.log("data insert failed");
          console.log(err);
        });
    } catch {
      console.log(err);
    }
  },
  columnInsert: function (req, res, next) {
    let analyId = req.params.al_id;
    let body = req.body;
    let size = null;
    if (body.dataSize != "") {
      size = body.dataSize;
    }
    models.column_tb
      .create({
        al_id_col: analyId,
        data_type: body.colType,
        data_size: size,
        column_name: body.colName,
      })
      .then((result) => {
        console.log("column insert succeed");
        res.redirect("/analysis/view/" + analyId);
      })
      .catch((err) => {
        console.log("column insert failed");
        console.log(err);
      });
  },
  edit: function (req, res, next) {
    let analyId = req.params.al_id;
    let body = req.body;
    models.analysis_list
      .update(
        {
          al_name: body.editName,
          al_ns : body.editNs,
          al_des: body.editDes,
        },
        {
          where: { al_id: analyId },
        }
      )
      .then((result) => {
        console.log("data update complete");
        res.redirect("/analysis/view/" + analyId);
      })
      .catch((err) => {
        console.log("data update failed");
        console.log(err);
      });
  },
  delete: async (req, res) => {
    let analyId = req.params.al_id;
    let analyNs = req.body.al_ns;
    await models.analysis_list
      .destroy({
        where: { al_id: analyId },
      })
      .then(async (result) => {
        console.log("data delete complete");
        await axios.delete("http://203.253.128.184:18827/datamodels/" + analyNs + "/" + analyId + "/1.0", { headers: { Accept: "application/json" } });
        res.redirect("/analysis/list");
      })
      .catch((err) => {
        console.log("data delete failed");
        console.log(err);
      });
  },
  deleteList: async (req, res) => {
    var delListId = [];
    delListId = req.body.deleteList.split(",");
    await models.analysis_list
      .findAll({
        attributes: ["al_ns"],
        where: {
          al_id: { [Op.in]: delListId },
        },
      })
      .then(async (result) => {
        var nsList = [];
        const test = JSON.stringify(result);
        const newValue = JSON.parse(test);
        newValue.map((el) => nsList.push(el.al_ns));
        await models.analysis_list
          .destroy({
            where: {
              al_id: { [Op.in]: delListId },
            },
          })
          .then(async (result) => {
            for (var i = 0; i < delListId.length; i++) {
              await axios.delete("http://203.253.128.184:18827/datamodels/" + nsList[i] + "/" + delListId[i] + "/1.0", { headers: { Accept: "application/json" } });
            }
            res.redirect("/analysis/list");
          })
          .catch((err) => {
            console.log("data delete failed");
            console.log(err);
          });
      })
      .catch((err) => {
        console.log("data delete failed");
        console.log(err);
      });
  },
  colDelete: async (req, res) => {
    let colId = req.params.col_id;
    let viewNum = req.body.alNum;
    await models.column_tb
      .destroy({
        where: { col_id: colId },
      })
      .then((result) => {
        console.log("column delete complete");
        res.redirect("/analysis/view/" + viewNum);
      })
      .catch((err) => {
        console.log("column delete failed");
        console.log(err);
      });
  },
};

module.exports = {
  output,
  process,
};
