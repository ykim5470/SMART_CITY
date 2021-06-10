const express = require("express");
const models = require("../models");
const router = express.Router();

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
  insert: function (req, res, next) {
    let body = req.body;
    models.analysis_list
      .create({
        al_name: body.tableName,
        al_des: body.description,
      })
      .then((result) => {
        console.log("analysis data insert succeed");
        res.redirect("/analysis/list");
      })
      .catch((err) => {
        console.log("data insert failed");
        console.log(err);
      });
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
        res.redirect("/analysis/list");
      })
      .catch((err) => {
        console.log("column insert failed");
        console.log(err);
      });
  },
  edit : function(req,res,next){
    let analyId = req.params.al_id;
    let body = req.body;
    models.analysis_list.update({
      al_name : body.editName,
      al_des : body.editDes
    },{
      where: {al_id:analyId}
    }).then( result =>{
      console.log("data update complete");
      res.redirect("/analysis/list");
    }).catch(err =>{
      console.log("data update failed");
      console.log(err);
    });
  },
  delete : async(req,res)=>{
    let analyId = req.params.al_id;
    await models.analysis_list.destroy({
      where : {al_id:analyId}
    }).then(result=>{
      console.log("data delete complete");
      res.redirect("/analysis/list");
    }).catch(err=>{
      console.log("data delete failed");
      console.log(err);
    });
  },
  
};

module.exports = {
  output,
  process,
};
