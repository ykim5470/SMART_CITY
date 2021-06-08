const express = require("express");
const router = express.Router();

// Get
const output = {
  fff: async (req, res) => {
    try {
      const data = await model_list.findAll();
      return res.render("model/model_manage_board", { test: "a", allList: data });
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
};

// Post
const process = {};

module.exports = {
  output,
  process,
};
