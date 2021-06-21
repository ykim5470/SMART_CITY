const express = require("express");
const { analysis_list, column_tb } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;

// Get
const output = {
  //테이블 등록 화면
  plus: function (req, res, next) {
    res.render("analysis/al_insert");
  },
  //테이블 목록
  show: async (req, res) => {
    let pageNum = req.params.page; // 요청 페이지 넘버
    let offset = 0;
    if (pageNum > 1) {
      offset = 10 * (pageNum - 1);
    }
    await analysis_list.findAndCountAll({offset:offset, limit:10, where: { al_delYn: "N" }, order: [["createdAt", "DESC"]] }).then((result) => {
      const totalCnt = Math.ceil(result.count/10);
      const pageVal = [];
      res.render("analysis/al_list", { anaList: result.rows ,  total : totalCnt });
    });
  },
  viewDelList: function (req, res, next) {
    analysis_list.findAll({ where: { al_delYn: "Y" } }).then((result) => {
      res.render("analysis/al_list", { anaList: result, admin: "admin" });
    });
  },
  //테이블 & 해당 컬럼 조회
  view: async (req, res) => {
    let analysisId = req.params.al_id;
    try {
      await analysis_list
        .findOne({
          where: { al_id: analysisId },
        })
        .then(async (result) => {
          if (result) {
            let ana = result;
            await column_tb
              .findAll({
                where: { al_id_col: analysisId },
              })
              .then((result) => {
                res.render("analysis/al_view", { analysis: ana, column: result });
              });
          }
        });
    } catch (err) {
      console.log(err);
    }
  },
  delView: async (req, res) => {
    let analysisId = req.params.al_id;
    try {
      await analysis_list
        .findOne({
          where: { al_id: analysisId },
        })
        .then(async (result) => {
          if (result) {
            let ana = result;
            await column_tb
              .findAll({
                where: { al_id_col: analysisId },
              })
              .then((result) => {
                res.render("analysis/al_view", { analysis: ana, column: result, admin: "admin" });
              });
          }
        });
    } catch (err) {
      console.log(err);
    }
  },
  //테이블 수정 화면
  edit: async (req, res) => {
    let analysisId = req.params.al_id;
    await analysis_list
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
  //테이블 등록
  insert: async (req, res) => {
    let body = req.body;
    try {
      if (body.tableName && body.description && body.version && body.nameSpace && body.context) {
        await analysis_list
          .create({
            al_name: body.tableName,
            al_ns: body.nameSpace,
            al_des: body.description,
            al_version: body.version,
            al_context: body.context,
          })
          .then((result) => {
            console.log("analysis data insert succeed");
            const conList = result.al_context.split(",");
            // axios({ //페이징 구현 확인을 위해 일단 막기
            //   //데이터 모델 생성 요청
            //   method: "post",
            //   url: "http://203.253.128.184:18827/datamodels",
            //   data: {
            //     type: result.al_name,
            //     namespace: result.al_ns,
            //     version: result.al_version,
            //     context: conList,
            //     description: result.al_des,
            //     attributes: [
            //       {
            //         name: "name",
            //         isRequired: true,
            //         attributeType: "Property",
            //         maxLength: 50,
            //         valueType: "String",
            //       },
            //     ],
            //   },
            //   headers: { "Content-Type": "application/json" },
            // });
            res.redirect("/analysis/list");
          });
      } else {
        res.render("analysis/al_insert", { blank: "nullPointException" });
      }
    } catch (err) {
      console.log("data insert failed");
      console.log(err);
    }
  },
  //컬럼생성
  columnInsert: async (req, res) => {
    let analyId = req.params.al_id;
    let body = req.body;
    let size = null;
    if (body.dataSize != "") {
      size = body.dataSize;
    }
    try {
      await column_tb
        .create({
          al_id_col: analyId,
          data_type: body.colType,
          data_size: size,
          column_name: body.colName,
        })
        .then((result) => {
          console.log("column insert succeed");
          res.redirect("/analysis/view/" + analyId);
        });
    } catch (err) {
      console.log(err);
    }
  },
  //테이블 수정
  edit: async (req, res) => {
    let analyId = req.params.al_id;
    let body = req.body;
    analysis_list
      .update(
        {
          al_name: body.editName,
          al_ns: body.editNs,
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
  // -------------------------- 삭제 기능 ---------------------------
  //테이블 소프트 삭제
  tbSofeDel: async (req, res) => {
    let analyId = req.params.al_id;
    try {
      await analysis_list
        .findOne({ where: { al_id: analyId } })
        .then(async (result) => {
          const name = result.al_name;
          //데이터 삭제 요청 = 페이징 구현 확인을 위해 일단 막기
          //await axios.delete(`http://203.253.128.184:18827/datamodels/${result.al_ns}/${result.al_name}/${result.al_version}`, { headers: { Accept: "application/json" } });
          console.log("data delete request succeed");
          await analysis_list.update({ al_name: "deleted_" + name, al_delYn: "Y" }, { where: { al_id: analyId } });
        })
        .then((result) => {
          console.log("data soft delete succeed");
          res.redirect("/analysis/list/");
        });
    } catch (err) {
      console.log(err);
      console.log("data softdelete failed");
    }
  },
  //테이블 일괄 소프트 삭제
  softDelList: async (req, res) => {
    var delListId = [];
    delListId = req.body.deleteList.split(",");
    try {
      await analysis_list
        .findAll({
          attributes: ["al_name", "al_ns", "al_version"],
          where: { al_id: { [Op.in]: delListId } },
        })
        .then(async (result) => {
          var nameList = [];
          var nsList = [];
          var verList = [];
          const temp = JSON.stringify(result);
          const newTemp = JSON.parse(temp);
          newTemp.map((el) => nameList.push(el.al_name));
          newTemp.map((el) => nsList.push(el.al_ns));
          newTemp.map((el) => verList.push(el.al_version));
          for (var i = 0; i < nameList.length; i++) {
            //데이터 삭제 요청 = 페이징 구현 확인을 위해 일단 막기
            //await axios.delete(`http://203.253.128.184:18827/datamodels/${nsList[i]}/${nameList[i]}/${verList[i]}`, { headers: { Accept: "application/json" } });
            await analysis_list.update({ al_name: "deleted_" + nameList[i] }, { where: { al_ns: nsList[i], al_version: verList[i] } });
          }
          await analysis_list.update({ al_delYn: "Y" }, { where: { al_id: { [Op.in]: delListId } } });
          res.redirect("/analysis/list");
        });
    } catch (err) {
      console.log("data list soft delete failed");
      console.log(err);
    }
  },
  //테이블 개별 삭제 (DB까지)
  tbHardDel: async (req, res) => {
    let analyId = req.params.al_id;
    let analyNs = req.body.al_ns;
    await analysis_list
      .destroy({
        where: { al_id: analyId },
      })
      .then(async (result) => {
        console.log("data delete complete");
        //삭제 요청 이미 요청...됐을테니...
        // await axios.delete(`http://203.253.128.184:18827/datamodels/${analyNs}/${analyId}/1.0`, { headers: { Accept: "application/json" } });
        res.redirect("/analysis/admin/deleted");
      })
      .catch((err) => {
        console.log("data delete failed");
        console.log(err);
      });
  },
  //테이블 일괄 삭제( DB까지)
  deleteList: async (req, res) => {
    var delListId = [];
    delListId = req.body.deleteList.split(",");
    try {
      await analysis_list
        .destroy({
          where: {
            al_id: { [Op.in]: delListId },
          },
        })
        .then(async (result) => {
          console.log("delete List hard delete succeed");
          res.redirect("/analysis/admin/deleted");
        });
    } catch (err) {
      console.log("data delete failed");
      console.log(err);
    }
  },
  //컬럼삭제 (db까지)
  colDelete: async (req, res) => {
    let colId = req.params.col_id;
    let viewNum = req.body.alNum;
    await column_tb
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
