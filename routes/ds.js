const express = require("express");
const { analysis_list, column_tb, dataset } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");
const newAnaly = require("./newAnaly");

//post url
const dataRequest = {
  insert: async (result) => {
    console.log("========DATASET CREATE REQUEST==========");
    console.log(result)
    await axios({
      method: "post",
      url: "http://203.253.128.184:18827/datasets",
      data: result,
      headers: { "Content-Type": "application/json" },
    });
  },
  getIdList: async (id) => {
    console.log("===========DATASET ID LIST REQUEST=============");
    let idList = [];
    let reValue = "false";
    await axios.get("http://203.253.128.184:18827/datasets", { headers: { Accept: "application/json" } }).then((result) => {
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
  // delOne: async (result) => {
  //   console.log("========ONE DATA MODEL DELETE REQUEST==========");
  //   await axios.delete(`http://203.253.128.184:18827/datamodels/${result.al_ns}/${result.al_name}/${result.al_version}`, { headers: { Accept: "application/json" } });
  // },
  // delList: async (name, ns, version) => {
  //   console.log("========DATA MODEL LIST DELETE REQUEST==========");
  //   await axios.delete(`http://203.253.128.184:18827/datamodels/${ns}/${name}/${version}`, { headers: { Accept: "application/json" } });
  // },
  // edit: async (result) => {
  //   console.log("===========DATA MODEL EDIT REQUEST=============");
  //   try {
  //     const colTemp = JSON.parse(JSON.stringify(result))[0]; // result 담기
  //     const conList = colTemp.al_context.split(","); //context 배열
  //     const colList = colTemp.column_tbs;
  //     let nullTF = "";
  //     let temp = "";
  //     let requestCol = [];
  //     for (var i = 0; i < colList.length; i++) {
  //       nullTF = colList[i].allowNull == "true" ? false : true;
  //       temp = { name: colList[i].column_name, isRequired: nullTF, attributeType: colList[i].attributeType, maxLength: colList[i].data_size, valueType: colList[i].data_type };
  //       requestCol.push(JSON.parse(JSON.stringify(temp)));
  //     }
  //     await axios({
  //       method: "PUT",
  //       url: `http://203.253.128.184:18827/datamodels/${colTemp.al_ns}/${colTemp.al_name}/${colTemp.al_version}`,
  //       data: {
  //         context: conList,
  //         description: colTemp.al_des,
  //         attributes: requestCol,
  //       },
  //       headers: { "Content-Type": "application/json" },
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
};

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
  dupCheck: async (req, res) => {
    const id = req.params.checkId;
    dataRequest.getIdList(id).then((result) => {
      res.send(result);
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
    await dataset.findAndCountAll({ limit: req.query.limit, offset: offset, where: { ds_delYn: "N" }, order: [["createdAt", "DESC"]] }).then((results) => {
      const itemCount = results.count; //총 게시글 갯수
      const pageCount = Math.ceil(itemCount / req.query.limit); //페이지 갯수
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
          res.render("dataset/ds_view", { ds : result });
        });
    } catch (err) {
      console.log(err);
    }
  },
};
const process = {
  insert: async (req, res) => {
    const body = req.body;
    const valArr = body.getValue.split(","); //값을 입력한 컬럼의 배열 생성
    let obj = {};
    valArr.map((el) => {
      obj[el] = body[el];
    });
    await dataset.create(obj).then(async (result) => {
      await dataset
        .findOne({
          attributes: [
            ["dataset_id", "id"],
            "name",
            "description",
            "updateInterval",
            "category",
            "providerOrganization",
            "providerSystem",
            "isProcessed",
            "ownership",
            "keywords",
            "license",
            "providingApiUri",
            "restrictions",
            "datasetExtension",
            "datasetItems",
            "targetRegions",
            "storageRetention",
            "topicRetention",
            "sourceDatasetIds",
            "qualityCheckEnabled",
            "dataIdentifierType",
            "dataModelType",
            "dataModelNamespace",
            "dataModelVersion",
          ],
          where: { ds_id: JSON.stringify(result.ds_id) },
        })
        .then((result) => {
          let newValue = "";
          let sTemp = "";
          const inRequest = JSON.parse(JSON.stringify(result));
          Object.values(inRequest).map((el, index) => {
            if (el != null) {
              if (Object.keys(inRequest)[index] == "sourceDatasetIds") {
                sTemp = Object.values(inRequest)[index].split(",");
                const sArr = JSON.stringify(sTemp);
                newValue += `[${JSON.stringify(Object.keys(inRequest)[index])} : ${sArr}]`;
              } else {
                newValue += JSON.stringify(Object.entries(inRequest)[index]).replace(",", ":");
              }
            }
          });
          newValue = newValue.split("][").join(",");
          newValue = newValue.replace("[", "{");
          newValue = newValue.slice(0, -1) + "}";
          console.log(newValue)
          dataRequest.insert(newValue);
          res.redirect("/ds/list");
        });
    });
  },
};

module.exports = {
  output,
  process,
};
