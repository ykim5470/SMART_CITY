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
    const aa = result.types.split(",");
    let broType = result.brokerStorageTypes;
    let handType = result.handlerStorageTypes;
    let type = [];
    aa.map((el) => {
      if (el == "dataServiceBroker") {
        broType != null ? (broType = broType.split(",")) : broType;
        const bro = { type: el, bigDataStorageTypes: broType };
        type.push(bro);
      } else {
        handType != null ? (handType = handType.split(",")) : handType;
        const hand = { type: el, bigDataStorageTypes: handType };
        type.push(hand);
      }
    });
    try {
      const res = await axios({
        method: "post",
        url: `${base.DATA_MANAGER}/datasets/${result.dataset_id}/flow`,
        data: {
          historyStoreType: result.historyStoreType,
          description: result.description,
          enabled: result.enabled,
          targetTypes: type,
        },
        headers: { "Content-Type": "application/json" },
      });
      let bol = "succeed";
      if (Math.floor(res.status / 100) == 2) {
        return bol;
      }
    } catch (err) {
      console.log(err)
      return err;
    }
  },
  delOne: async (dsId) => {
    console.log("========ONE DATA DATAFLOW DELETE REQUEST==========");
    try{
      const res = await axios.delete(`${base.DATA_MANAGER}/datasets/${dsId}/flow`, { headers: { Accept: "application/json" } });
      return "succeed"
    }catch(err){
      return err;
    }
  },
};

const output = {
  insert: async (req, res) => {
    await dataset.findAll({ attributes: ["dataset_id"], where: { ds_delYn: "N", ds_setYn: "N" } }).then((result) => {
      res.render("dataflow/df_insert", { df: result });
    });
  },
  //테이블 리스트
  list: async (req, res) => {
    const currentPage = req.query.page; //현재 페이지
    const temp = req.url; // 현재 경로
    let offset = 0;
    if (currentPage > 1) {
      offset = 10 * (currentPage - 1);
    }
    await dataflow.findAndCountAll({ limit: req.query.limit, offset: offset, where: { df_delYn: "N" }, order: [["createdAt", "DESC"]] }).then((results) => {
      const itemCount = results.count; //총 게시글 갯수
      const pageCount = Math.ceil(itemCount / req.query.limit); //페이지 갯수
      const base = "list";
      const pageArray = newAnaly.paging.makeArray(base, currentPage, pageCount, temp);
      const hasMore = currentPage < pageCount ? `${base}?page=${currentPage + 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      const hasprev = currentPage > 1 ? `${base}?page=${currentPage - 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      dataflow.prototype.dateFormat = (date) => moment(date).format("YYYY.MMM.DD - hh:mm A");
      res.render("dataflow/df_list", { dataList: results.rows, pages: pageArray, nextUrl: hasMore, prevUrl: hasprev });
    });
  },
  //상세보기
  view: async (req, res) => {
    let dfId = req.params.df_id;
    try {
      await dataflow
        .findOne({
          where: { df_id: dfId },
        })
        .then(async (result) => {
          res.render("dataflow/df_view", { df: result });
        });
    } catch (err) {
      console.log(err);
    }
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
          if (typeof item != "string") {
            item = item.toString();
          }
          item != "" ? item : (item = null);
          inValue[key] = item;
        });
      });
      await dataflow.create(inValue).then(async (result) => {
        const reResult = await dataRequest.insert(result);
        if (reResult == "succeed") {
          await dataset.update({ ds_setYn: "Y" }, { where: { dataset_id: inValue.dataset_id } });
          res.redirect("/df/list");
        } else {
          console.log("======= error code : " + JSON.parse(JSON.stringify(reResult)).message + " =========");
          await dataflow.update({ df_delYn: "Y" }, { where: { df_id: result.df_id } });
          // await dataflow.destroy({ where: { df_id: result.df_id } });
          res.send("<script> alert('잘못된 형식의 입력값입니다. 확인 후 다시 등록해주세요'); location.href='/df/insert';</script>");
          //res.send("<script> alert('잘못된 형식의 입력값입니다. 확인 후 다시 등록해주세요'); location.href=history.back();</script>");
        }
      });
    } catch (err) {
      console.log("===========================================");
      console.log(err);
    }
  },
  //dataflow 소프트 삭제
  softDelOne: async (req, res) => {
    const dfId = req.params.df_id;
    const datasetId = await dataflow.findOne({ attributes: ["dataset_id"], where: { df_id: dfId } });
    try {
      const deRequest = await dataRequest.delOne(datasetId.dataset_id);
      if (deRequest == "succeed") {
        await dataflow.update({ df_delYn: "Y" }, { where: { df_id: dfId } });
        await dataset.update({ ds_setYn: "N" }, { where: { dataset_id: datasetId.dataset_id } });
        res.redirect("/df/list")
      } else {
        console.log("======= error code : " + JSON.parse(JSON.stringify(deRequest)).message + " =========");
        res.send("<script> alert('삭제 할 수 없는 데이터 입니다. 확인 후 다시 시도해주세요'); history.go(-1);</script>");
      }
    } catch (err) {
      console.log(err)
      console.log("data softdelete failed");
    }
  },
  //dataflow 일괄 소프트 삭제
  softDelList: async (req, res) => {
    var delListId = req.body.deleteList.split(",");
    try {
      var datasetId = [];
      for(var i=0; i<delListId.length; i++){
        let tempId = await dataflow.findOne({attributes:["dataset_id"],where:{df_id:delListId[i]}})
        datasetId.push(tempId.dataset_id);
      }
      for (var i = 0; i < datasetId.length; i++) {
        const delRequest = await dataRequest.delOne(datasetId[i]);
        if(delRequest != "succeed"){
          console.log("======= error code : " + JSON.parse(JSON.stringify(delRequest)).message + " =========");
          res.send("<script> alert('삭제 할 수 없는 데이터가 있습니다. 확인 후 다시 시도해주세요');  location.href='/df/list';</script>");
        }else{
          await dataflow.update({ df_delYn: "Y" }, { where: { df_id: delListId[i] } });
          await dataset.update({ ds_setYn: "N" }, { where: { dataset_id: datasetId[i] } });
        }
      }
      res.redirect("/df/list");
    } catch (err) {
      console.log("data list soft delete failed")
    }
  },
};

module.exports = {
  output,
  process,
};
