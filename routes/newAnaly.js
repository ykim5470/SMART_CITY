const express = require("express");
const { analysis_list, column_tb } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");

//post url
const dataRequest = {
  insert: async (result, conList, column) => {
    console.log("========DATA MODEL CREATE REQUEST==========")
    await axios({
      method: "post",
      url: "http://203.253.128.184:18827/datamodels",
      data: {
        type: result.al_name,
        namespace: result.al_ns,
        version: result.al_version,
        context: conList,
        description: result.al_des,
        attributes: column,
      },
      headers: { "Content-Type": "application/json" },
    });
  },
};

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
    const body = req.body;
    let size = [];
    try {
      //null예외처리
      for (var i = 0; i < body.colType.length; i++) {
        size.push(null);
        if (body.colName[i] == "") {
          res.render("newAnaly/n_insert", { blank: "nullPointException" });
          return;
        }
        if (body.dataSize[i] != "") {
          size[i] = body.dataSize[i];
        }
      }
      if (body.tableName && body.description && body.version && body.nameSpace && body.context) {
        await analysis_list
          .create({
            al_name: body.tableName,
            al_ns: body.nameSpace,
            al_des: body.description,
            al_version: body.version,
            al_context: body.context,
          })
          .then(async (result) => {
            let temp = "";
            let column = [];
            let nullTF = "";
            const conList = result.al_context.split(",");
            for (var i = 0; i < body.colType.length; i++) {
              nullTF = body.allowNull[i] == "true" ? false : true;
              await column_tb.create({
                al_id_col: result.al_id,
                data_type: body.colType[i],
                data_size: size[i],
                column_name: body.colName[i],
                allowNull: body.allowNull[i],
                attributeType: body.attribute[i],
              });
              temp = {
                name: body.colName[i],
                isRequired: nullTF,
                attributeType: body.attribute[i],
                maxLength: body.dataSize[i],
                valueType: body.colType[i]
              };
              column.push(JSON.parse(JSON.stringify(temp)));
            }
            console.log(column);
            dataRequest.insert(result,conList, column);
            res.redirect("insert");
          });
      } else {
        res.render("newAnaly/n_insert", { blank: "nullPointException" });
      }
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
