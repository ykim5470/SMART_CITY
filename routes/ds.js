const express = require("express");
const { analysis_list, dataset } = require("../models");
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
      url: `${base.DATA_MANAGER}/datasets`,
      data: result,
      headers: { "Content-Type": "application/json" },
    });
  },
  getIdList: async (id) => {
    console.log("===========DATASET ID LIST REQUEST=============");
    let idList = [];
    let reValue = "false";
    await axios.get(`${base.DATA_MANAGER}/datasets`, { headers: { Accept: "application/json" } }).then((result) => {
      result.data.map((el) => {
        idList.push(el.id);
      });
      for (var i = 0; i < idList.length; i++) {
        if (idList[i] === id) {
          reValue = "true";
          return reValue;
        }
      }
    });
    return reValue;
  },
  delOne: async (dsId) => {
    console.log("========ONE DATA MODEL DELETE REQUEST==========");
    await axios.delete(`${base.DATA_MANAGER}/datasets/${dsId}`, { headers: { Accept: "application/json" } });
  },
  delList: async (dsId) => {
    console.log("========DATASET LIST DELETE REQUEST==========");
    await axios.delete(`${base.DATA_MANAGER}/datasets/${dsId}`, { headers: { Accept: "application/json" } });
  },
  edit: async (result, dsId) => {
    console.log("===========DATA MODEL EDIT REQUEST=============");
    try {
      await axios({
        method: "PUT",
        url: `${base.DATA_MANAGER}/datasets/${dsId}`,
        data: result,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  },
};

const output = {
  insert: async (req, res) => {
    await analysis_list.findAll({ attributes: ["al_id", "type"], where: { al_delYn: "N" } }).then((result) => {
      res.render("dataset/ds_insert", { analy: result });
    });
  },
  //dataset insert > ??????????????? id ?????? ???
  getNsVer: async (req, res) => {
    await analysis_list.findOne({ attributes: ["al_ns", "al_version"], where: { al_id: req.params.id } }).then((result) => {
      res.send(result);
    });
  },
  //dataset id ???????????? 
  dupCheck: async (req, res) => {
    const id = req.params.checkId;
    dataRequest.getIdList(id).then((result) => {
      res.send(result);
    });
  },
  //????????? ?????????
  list: async (req, res) => {
    const currentPage = req.query.page; //?????? ?????????
    const temp = req.url; // ?????? ??????
    let offset = 0;
    if (currentPage > 1) {
      offset = 10 * (currentPage - 1);
    }
    await dataset.findAndCountAll({ limit: req.query.limit, offset: offset, where: { ds_delYn: "N" }, order: [["createdAt", "DESC"]] }).then((results) => {
      const itemCount = results.count; //??? ????????? ??????
      const pageCount = Math.ceil(itemCount / req.query.limit); //????????? ??????
      const base = "list";
      const pageArray = newAnaly.paging.makeArray(base, currentPage, pageCount, temp);
      const hasMore = currentPage < pageCount ? `${base}?page=${currentPage + 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      const hasprev = currentPage > 1 ? `${base}?page=${currentPage - 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      dataset.prototype.dateFormat = (date) => moment(date).format("YYYY.MMM.DD - hh:mm A");
      res.render("dataset/ds_list", { dataList: results.rows, pages: pageArray, nextUrl: hasMore, prevUrl: hasprev });
    });
  },
  view: async (req, res) => {
    let dsId = req.params.ds_id;
    try {
      await dataset
        .findOne({
          where: { ds_id: dsId },
        })
        .then(async (result) => {
          res.render("dataset/ds_view", { ds: result });
        });
    } catch (err) {
      console.log(err);
    }
  },
  edit: async (req, res) => {
    let dsId = req.params.ds_id;
    try {
      await dataset
        .findOne({
          where: { ds_id: dsId },
        })
        .then(async (result) => {
          const ds = result;
          await analysis_list
            .findAll({
              attributes: ["al_name", "al_id"],
              where: { al_delYn: "N" },
            })
            .then((result) => {
              res.render("dataset/ds_edit", { ds: ds, moList: result });
            });
        });
    } catch (err) {
      console.log(err);
    }
  },
};
const process = {
  insert: async (req, res) => {
    const body = req.body;
    const valArr = body.getValue.split(","); //?????? ????????? ????????? ?????? ??????
    let obj = {};
    try {
      valArr.map((el) => {
        obj[el] = body[el];
      });
      await dataset.create(obj).then(async (result) => {
        await dataset
          .findOne({
            attributes: { exclude: ["ds_id", "createdAt", "updatedAt", "ds_delYn", "al_id" , "ds_setYn"] },
            where: { ds_id: JSON.stringify(result.ds_id) },
          })
          .then((result) => {
            const reTemp = [result.dataValues];
            let inResult = {};
            reTemp.map((el) => {
              Object.values(el).filter((item, index) => {
                if (item != null) {
                  if (Object.keys(el)[index] == "dataset_id") {
                    inResult["id"] = item;
                  } else if (Object.keys(el)[index] == "sourceDatasetIds") {
                    inResult[Object.keys(el)[index]] = item.split();
                  } else {
                    inResult[Object.keys(el)[index]] = item;
                  }
                }
              });
            });
            dataRequest.insert(inResult);
            res.redirect("/ds/list");
          });
      });
    } catch (err) {
      if (err.errors.length > 1) {
        errCode = JSON.parse(JSON.stringify(err.errors));
        for (var i = 0; i < errCode.length; i++) {
          if (errCode[i].type.includes("notNull")) {
            res.send("<script>alert('?????? ?????? ????????? ?????? ???????????? ?????????. ?????? ??? ?????? ??????????????????'); location.href=history.back();</script>");
            break;
          }
        }
      } else {
        errCode = JSON.stringify(err)
        if (errCode.includes("cannot be null")) {
          res.send("<script>alert('?????? ?????? ????????? ?????? ???????????? ?????????. ?????? ??? ?????? ??????????????????'); location.href=history.back();</script>");
        }
      }
    }
  },
  //dataset ????????? ??????
  dsSofeDel: async (req, res) => {
    const dsId = req.params.dataset_id;
    const rand = "deleted_" + moment().format("YYMMDDHHmmss") + "_";
    try {
      await dataset.update({ ds_delYn: "Y", dataset_id: rand + dsId }, { where: { dataset_id: dsId } }).then(async (result) => {
        //????????? ?????? ??????
        dataRequest.delOne(dsId);
        res.redirect("/ds/list");
      });
    } catch (err) {
      console.log(err);
      console.log("data softdelete failed");
    }
  },
  //dataset ????????? ?????? ??????
  softDelList: async (req, res) => {
    var delListId = req.body.deleteList.split(",");
    const rand = "deleted_" + moment().format("YYMMDDHHmmss") + "_";
    try {
      for (var i = 0; i < delListId.length; i++) {
        await dataset.update({ ds_delYn: "Y", dataset_id: rand + delListId[i] }, { where: { dataset_id: delListId[i] } });
        dataRequest.delList(delListId[i]);
      }
      res.redirect("/ds/list");
    } catch (err) {
      console.log("data list soft delete failed");
      console.log(err);
    }
  },
  edited: async (req, res) => {
    const body = [req.body];
    try {
      let edit = {};
      body.map((el) => {
        Object.values(el).filter((item, index) => {
          item != "" ? item : (item = null);
          let key = Object.keys(el)[index];
          edit[key] = item;
        });
      });
      if(edit.isProcessed==null){
        edit.isProcessed = "???????????????"
      }
      await dataset.update(edit, { where: { ds_id: req.params.ds_id } });
      await dataset
        .findOne({
          attributes: { exclude: ["ds_id", "createdAt", "updatedAt", "ds_delYn", "al_id"] },
          where: { ds_id: req.params.ds_id },
        })
        .then((result) => {
          const reTemp = [result.dataValues];
          let edResult = {};
          let dId = "";
          reTemp.map((el) => {
            Object.values(el).filter((item, index) => {
              if (item != null) {
                if (Object.keys(el)[index] == "dataset_id") {
                  dId = item;
                } else if (Object.keys(el)[index] == "sourceDatasetIds") {
                  edResult[Object.keys(el)[index]] = item.split();
                } else {
                  edResult[Object.keys(el)[index]] = item;
                }
              }
            });
          });
          dataRequest.edit(edResult, dId);
          res.redirect("/ds/view/" + req.params.ds_id);
        });
    } catch (err) {
      if (err.errors.length > 1) {
        errCode = JSON.parse(JSON.stringify(err.errors));
        for (var i = 0; i < errCode.length; i++) {
          if (errCode[i].type.includes("notNull")) {
            res.send("<script>alert('?????? ?????? ????????? ?????? ???????????? ?????????. ?????? ??? ?????? ??????????????????'); location.href=history.back();</script>");
            break;
          }
        }
      } else {
        errCode = JSON.stringify(err)
        if (errCode.includes("cannot be null")) {
          res.send("<script>alert('?????? ?????? ????????? ?????? ???????????? ?????????. ?????? ??? ?????? ??????????????????'); location.href=history.back();</script>");
        }
      }
    }
  },
};

module.exports = {
  output,
  process,
};
