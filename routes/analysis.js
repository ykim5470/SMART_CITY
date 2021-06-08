const express = require("express");
const router = express.Router();

// Get
const output = {
  plus : function(req,res,next){res.render("al_insert")},
};

// Post
const process = {};

module.exports = {
  output,
  process,
};
