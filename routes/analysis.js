const express = require("express");
const models = require("../models");
const router = express.Router();

// Get
const output = {
  plus : function(req,res,next){res.render("analysis/al_insert")},
  show : function(req,res,next){
    models.analysis_list.findAll().then(result=>{
      res.render("analysis/al_list",{ anaList : result})
    })
  },
};

// Post
const process = {
  insert: function(req,res,next){
    let body = req.body;
    models.analysis_list.create({
      al_name : body.tableName,
      al_des : body.description
    }).then(result =>{
      console.log("analysis data insert succeed")
      res.redirect("/analysis/view");
    }).catch(err=>{
      console.log("data insert failed");
      console.log(err);
    });
  },
};

module.exports = {
  output,
  process,
};
