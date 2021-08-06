const express = require("express");
const { analysis_list, column_tb, dataset, error_log } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");
const base = require("../base");
const { text } = require("express");
const paging = {
  makeArray: function (base, current, totalPg, path) {
    let start = current % 10 == 0 ? Math.floor((current - 1) / 10) * 10 + 1 : Math.floor(current / 10) * 10 + 1; // 페이징 시작 번호
    let end = current % 10 == 0 ? Math.ceil((current - 1) / 10) * 10 : Math.ceil(current / 10) * 10; // 페이징 끝 번호
    if (end > totalPg) {
      end = totalPg;
    }
    let pageArray = []; // 페이징 번호 담는 배열
    let newPath = "";
    for (var i = start; i <= end; i++) {
      if (path.indexOf("?page=") > -1) {
        newPath = path.replace("page=" + current, "page=" + i); // 현재경로를 해당 페이징 넘버 경로로 바꾸기
      } else {
        newPath = `${base}?page=${i}&limit=10`;
      }
      pageArray.push({
        number: i,
        url: newPath,
      });
    }
    return pageArray;
  },
};

//post url
const dataRequest = {
  insert: async (result) => {
    console.log("========DATA MODEL CREATE REQUEST==========");
    try {
      await axios({
        method: "post",
        url: `${base.DATA_MANAGER}/datamodels`,
        data: result,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return err.response.data;
    }
  },
  delOne: async (name, ns, ver) => {
    console.log("========DATA MODEL DELETE REQUEST==========");
    try {
      await axios.delete(`${base.DATA_MANAGER}/datamodels/${ns}/${name}/${ver}`, { headers: { Accept: "application/json" } });
    } catch (err) {
      return err.response.data;
    }
  },
  edit: async (result) => {
    console.log("===========DATA MODEL EDIT REQUEST=============");
    try {
      const colTemp = JSON.parse(JSON.stringify(result))[0]; // result 담기
      const conList = colTemp.al_context.split(","); //context 배열
      const colList = colTemp.column_tbs;
      let nullTF = "";
      let temp = "";
      let requestCol = [];
      for (var i = 0; i < colList.length; i++) {
        nullTF = colList[i].allowNull == "true" ? false : true;
        temp = { name: colList[i].column_name, isRequired: nullTF, attributeType: colList[i].attributeType, maxLength: colList[i].data_size, valueType: colList[i].data_type };
        requestCol.push(JSON.parse(JSON.stringify(temp)));
      }
      await axios({
        method: "PUT",
        url: `${base.DATA_MANAGER}/datamodels/${colTemp.al_ns}/${colTemp.al_name}/${colTemp.al_version}`,
        data: {
          context: conList,
          description: colTemp.al_des,
          attributes: requestCol,
        },
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  },
  getTypeList: async (type) => {
    console.log("===========DATA MODEL LIST REQUEST=============");
    let typeList = [];
    let reValue = "false";
    await axios.get(`${base.DATA_MANAGER}/datamodels`, { headers: { Accept: "application/json" } }).then((result) => {
      result.data.map((el) => {
        typeList.push(el.type);
      });
      for (var i = 0; i < typeList.length; i++) {
        if (typeList[i] === type) {
          reValue = "true";
          return reValue;
        }
      }
    });
    return reValue;
  },
  checkDsList: async (name) => {
    console.log("===========DATASET LIST REQUEST=============");
    var typeList = [];
    var plag = "false";
    await axios.get(`${base.DATA_MANAGER}/datamodels`, { headers: { Accept: "application/json" } }).then((result) => {
      result.data.map((el) => {
        typeList.push(el.dataModelType);
      });
      for (var i = 0; i < typeList.length; i++) {
        for (var j = 0; j < name.length; j++) {
          if (typeList[i] === name[j]) {
            plag = "true";
          }
        }
      }
    });
    return plag;
  },
};

// get
const output = {
  //테이블 등록 화면
  insert: function (req, res) {
    res.render("newAnaly/n_insert");
  },
  //테이블 리스트
  list: async (req, res) => {
    const currentPage = req.query.page; //현재 페이지
    const temp = req.url; // 현재 경로
    let offset = 0;
    if (currentPage > 1) {
      offset = 10 * (currentPage - 1);
    }
    await analysis_list.findAndCountAll({ limit: req.query.limit, offset: offset, where: { al_delYn: "N" }, order: [["createdAt", "DESC"]] }).then((results) => {
      const itemCount = results.count; //총 게시글 갯수
      const pageCount = Math.ceil(itemCount / req.query.limit); //페이지 갯수
      const base = "list";
      const pageArray = paging.makeArray(base, currentPage, pageCount, temp);
      const hasMore = currentPage < pageCount ? `${base}?page=${currentPage + 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      const hasprev = currentPage > 1 ? `${base}?page=${currentPage - 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      analysis_list.prototype.dateFormat = (date) => moment(date).format("YYYY.MMM.DD - hh:mm A");
      res.render("newAnaly/n_list", { anaList: results.rows, pages: pageArray, nextUrl: hasMore, prevUrl: hasprev, cnt: itemCount, pg: currentPage });
    });
  },
  viewDelList: function (req, res, next) {
    analysis_list.findAll({ where: { al_delYn: "Y" } }).then((result) => {
      res.render("newAnaly/n_list", { anaList: result, admin: "admin" });
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
                res.render("newAnaly/n_view", { analysis: ana, column: result });
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
    try {
      await analysis_list
        .findOne({
          where: { al_id: analysisId },
        })
        .then(async (result) => {
          const ana = result;
          await column_tb
            .findAll({
              where: { al_id_col: analysisId },
            })
            .then((result) => {
              res.render("newAnaly/n_edit", { analysis: ana, column: result });
            });
        });
    } catch (err) {
      console.log(err);
    }
  },
  dupCheck: async (req, res) => {
    const type = req.params.checkType;
    dataRequest.getTypeList(type).then((result) => {
      res.send(result);
    });
  },
  //수정 전 dataset check
  editChk: async (req, res) => {
    const analyId = req.params.id;
    await dataset.findAll({ attributes: ["dataset_id"], where: { al_id: analyId, ds_delYn: "N" } }).then((result) => {
      if (result.length > 0) {
        res.send(JSON.parse(`{"result":"no"}`));
      } else {
        res.send(JSON.parse(`{"result":"yes"}`));
      }
    });
  },
};

// post
const process = {
  //데이터 생성
  insert: async (req, res) => {
    const body = req.body;
    const alert = "<script>alert('별표 표시 항목은 필수 입력사항 입니다. 확인 후 다시 등록해주세요'); location.href=history.back();</script>";
    const alert2 = "<script>alert('DATA 생성 중 오류발생으로 생성이 완료 되지 않았습니다. 확인 후 다시 시도해주세요'); location.href=history.back();</script>";
    const col_name = ["attributeType", "valueType", "minLength", "maxLength", "column_name", "isRequired"];
    const rand = "deleted_" + moment().format("YYMMDDHHmmss") + "_";
    var table = {};
    var column = {};
    const t = await analysis_list.sequelize.transaction();
    try {
      for (var i = 0; i < Object.keys(body).length; i++) {
        if (col_name.includes(Object.keys(body)[i])) {
          //column_tb 속성일 경우
          let key = Object.entries(body)[i];
          if (typeof key[1] == "string") {
            key[1] != "" ? key[1] : (key[1] = null);
            column[key[0]] = [key[1]];
          } else {
            for (var j = 0; j < key[1].length; j++) {
              key[1][j] != "" ? key[1][j] : (key[1][j] = null);
            }
            column[key[0]] = key[1];
          }
        } else {
          //table 속성
          let key = Object.entries(body)[i];
          if (key[1] != "") {
            table[key[0]] = key[1];
          }
        }
      }
      let attrList = [];
      let tempCol = {};
      //const analy = await analysis_list.create(table, { transaction: t }); //table 등록
      var colKey = Object.keys(column);
      for (var i = 0; i < column.attributeType.length; i++) {
        tempCol = {};
        for (var j = 0; j < colKey.length; j++) {
          colKey[j] == "column_name" ? (colKey[j] = "name") : colKey[j];
          tempCol[colKey[j]] = Object.values(column)[j][i];
          //tempCol.al_id_col = analy.al_id;
        }
        //await column_tb.create(tempCol, { transaction: t });
        attrList.push(tempCol);
      }
      t.commit();
      attrList.map((el) => {
        for (var i in el) {
          if (el[i] === null) {
            delete el[i];
          }
        }
      });
      table.context = table.context.split();
      table.indexAttributeNames == undefined ? "" : (table.indexAttributeNames = table.indexAttributeNames.split());
      table.attributes = attrList;
      const creRequest = await dataRequest.insert(table);
      if (creRequest != undefined) {
        await error_log.create({ col_name: "analysis_list", col_id: analy.al_id, operation: "create", err_code: creRequest.detail });
        await analysis_list.update({ type: (rand + analy.type) , al_delYn: "Y" }, { where: { al_id: analy.al_id } });
        res.send(alert2);
      } else {
        res.redirect("/analysis/list/");
      }
    } catch (err) {
      console.log(err);
      t.rollback();
      if (err.errors[0].message.includes("cannot be null")) {
        res.send(alert);
      }
    }
  },
  //테이블 소프트 삭제
  softDelOne: async (req, res) => {
    const analyId = req.params.al_id;
    const rand = "deleted_" + moment().format("YYMMDDHHmmss") + "_";
    const alert = "<script>alert('해당 테이블을 참조하는 DATASET이 존재 합니다. DATASET 삭제 후 다시 시도 하십시오'); location.href=history.back();</script>";
    const alert2 = "<script>alert('api삭제를 진행 할 수 없습니다. 확인 후 다시 시도해 주세요'); location.href=history.back();</script>";
    try {
      //db에 해당 테이블을 참조하는 dataset이 있는지 확인
      const dbchk = await dataset.findAll({ attributes: ["ds_id"], where: { al_id: analyId, ds_delYn: "N" } });
      if (dbchk >= 1) {
        res.send(alert);
      }
      await analysis_list.findOne({ where: { al_id: analyId } }).then(async (result) => {
        const name = result.al_name;
        const ns = result.al_ns;
        const ver = result.al_version;
        //데이터 삭제 요청
        const delRequest = await dataRequest.delOne(name, ns, ver);
        if (delRequest != undefined) {
          let errDetail = delRequest.detail;
          errDetail.indexOf(". ") > 0 ? (errDetail = errDetail.substring(0, errDetail.indexOf(". "))) : errDetail;
          console.log(errDetail);
          await error_log.create({ col_name: "analysis_list", col_id: analyId, operation: "delete", err_code: errDetail });
          res.send(alert2);
        } else {
          await analysis_list.update({ al_name: rand + name, al_delYn: "Y" }, { where: { al_id: analyId } });
          res.redirect("/analysis/list/");
        }
      });
    } catch (err) {
      console.log(err);
      console.log("data softdelete failed");
    }
  },
  //테이블 일괄 소프트 삭제
  softDelList: async (req, res) => {
    var delListId = req.body.deleteList.split(",");
    const rand = "deleted_" + moment().format("YYMMDDHHmmss") + "_";
    const alert = "<script>alert('삭제하시려는 테이블 중 DATASET이 참조하고 있는 테이블이 존재합니다. DATASET 삭제 후 다시 시도 하십시오'); location.href=history.back();</script>";
    const alert2 = "<script>alert('TABLE 삭제 도중 오류가 발생했습니다. 확인 후 다시시도해주세요'); location.href='/analysis/list;</script>";
    try {
      await dataset.findAll({ attributes: ["ds_id"], where: { al_id: { [Op.in]: delListId }, ds_delYn: "N" } }).then(async (result) => {
        if (result.length > 0) {
          res.send(alert);
        } else {
          await analysis_list
            .findAll({
              attributes: ["al_name", "al_ns", "al_version", "al_id"],
              where: { al_id: { [Op.in]: delListId } },
            })
            .then(async (result) => {
              var nameList = [];
              var nsList = [];
              var verList = [];
              var idList = [];
              const temp = JSON.parse(JSON.stringify(result));
              temp.map((el) => {
                nameList.push(el.al_name);
                nsList.push(el.al_ns);
                verList.push(el.al_version);
                idList.push(el.al_id);
              });
              const apiChk = await dataRequest.checkDsList(nameList);
              if (apiChk == "true") {
                res.send(alert);
              }
              for (var i = 0; i < nameList.length; i++) {
                const delRequest = await dataRequest.delOne(nameList[i], nsList[i], verList[i]);
                if (delRequest != undefined) {
                  let errDetail = delRequest.detail;
                  errDetail = errDetail.substring(0, errDetail.indexOf(". "));
                  await error_log.create({ col_name: "analysis_list", col_id: idList[i], operation: "delete", err_code: errDetail });
                  res.send(alert2);
                } else {
                  await analysis_list.update({ al_name: rand + nameList[i], al_delYn: "Y" }, { where: { al_id: idList[i] } });
                }
              }
              res.redirect("/analysis/list/");
            });
        }
      });
    } catch (err) {
      console.log("data list soft delete failed");
      console.log(err);
    }
  },
  //테이블 수정
  edit: async (req, res) => {
    const analyId = req.params.al_id;
    const body = req.body;
    let size = [];
    try {
      //conId 값이 없는경우 빈객체로 선언 > 전부 새로 만드는 컬럼일 경우
      if (!body.colId) {
        body.colId = [];
      } else if (typeof body.colId == "string") {
        // 새로만드는 컬럼이 많은 경우 다른 값은 배열이어도 id값은 string 일 수 있기 때문에 따로 확인
        body.colId = body.colId.split();
      }
      //컬럼이 하나일 경우 배열로 변환
      if (typeof body.colName == "string") {
        body.colName = body.colName.split();
        body.colType = body.colType.split();
        body.dataSize = body.dataSize.split();
        body.allowNull = body.allowNull.split();
        body.attribute = body.attribute.split();
      }
      // DB 검색해서 현재 남아있는 id 외에 DB에만 남아있는 id를 가진 컬럼 삭제
      await column_tb.findAll({ attributes: ["col_id"], where: { al_id_col: analyId } }).then(async (result) => {
        let idList = [];
        let delList = [];
        const idTemp = JSON.parse(JSON.stringify(result));
        await idTemp.map((el) => {
          idList.push(el.col_id.toString());
        });
        delList = idList.filter((x) => !body.colId.includes(x));
        await column_tb.destroy({ where: { col_id: { [Op.in]: delList } } });
      });
      // data size null 처리
      for (var i = 0; i < body.dataSize.length; i++) {
        size.push(null);
        if (body.dataSize[i] != "") {
          size[i] = body.dataSize[i];
        }
      }
      //분석 테이블 DB 수정
      await analysis_list.update({ al_context: body.editContext, al_des: body.editDes }, { where: { al_id: analyId } });
      for (var i = 0; i < body.colName.length; i++) {
        if (body.colId[i]) {
          // colId가 있는경우 => 이미 전에 생성이 되어있는 경우 컬럼 수정
          await column_tb.update(
            {
              attributeType: body.attribute[i],
              data_type: body.colType[i],
              data_size: size[i],
              column_name: body.colName[i],
              allowNull: body.allowNull[i],
            },
            { where: { col_id: body.colId[i] } }
          );
        } else {
          // colId가 없는 경우 => 새로운 컬럼 생성
          await column_tb.create({
            al_id_col: analyId,
            attributeType: body.attribute[i],
            data_type: body.colType[i],
            data_size: size[i],
            column_name: body.colName[i],
            allowNull: body.allowNull[i],
          });
        }
      }
      await analysis_list
        .findAll({
          where: { al_id: analyId },
          include: [
            {
              model: column_tb,
              attributes: ["data_type", "column_name", "data_size", "allowNull", "attributeType"],
              require: false,
            },
          ],
        })
        .then((result) => {
          dataRequest.edit(result);
        });
      res.redirect("/analysis/view/" + analyId);
    } catch (err) {
      console.log("Data update failed");
      console.log(err);
    }
  },
};

module.exports = {
  output,
  process,
  paging,
};
