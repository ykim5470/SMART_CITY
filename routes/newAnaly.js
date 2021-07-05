const express = require("express");
const { analysis_list, column_tb } = require("../models");
const router = express.Router();
const axios = require("axios");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const moment = require("moment");
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
  insert: async (result, conList, column) => {
    console.log("========DATA MODEL CREATE REQUEST==========");
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
  delOne: async (result) => {
    console.log("========ONE DATA MODEL DELETE REQUEST==========");
    await axios.delete(`http://203.253.128.184:18827/datamodels/${result.al_ns}/${result.al_name}/${result.al_version}`, { headers: { Accept: "application/json" } });
  },
  delList: async (name, ns, version) => {
    console.log("========DATA MODEL LIST DELETE REQUEST==========");
    await axios.delete(`http://203.253.128.184:18827/datamodels/${ns}/${name}/${version}`, { headers: { Accept: "application/json" } });
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
        url: `http://203.253.128.184:18827/datamodels/${colTemp.al_ns}/${colTemp.al_name}/${colTemp.al_version}`,
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
  getTypeList : async (name)=>{
    console.log("===========DATA MODEL LIST REQUEST=============");
    let typeList =[];
    let reValue = "false";
    await axios.get("http://203.253.128.184:18827/datamodels",{ headers: { Accept: "application/json" } }).then((result)=>{
      result.data.map((el)=>{typeList.push(el.type)})
      for(var i=0; i<typeList.length; i++){
        if(typeList[i]===name){
          reValue = "true";
          return reValue;
        }
      }
    })
    return reValue
  }
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
      const base = 'list'
      const pageArray = paging.makeArray(base, currentPage, pageCount, temp);
      const hasMore = currentPage < pageCount ? `${base}?page=${currentPage + 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      const hasprev = currentPage > 1 ? `${base}?page=${currentPage - 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
      analysis_list.prototype.dateFormat = (date) => moment(date).format("YYYY.MMM.DD - hh:mm A");
      res.render("newAnaly/n_list", { anaList: results.rows, pages: pageArray, nextUrl: hasMore, prevUrl: hasprev });
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
  dupCheck : async(req,res)=>{
    const tbName = req.params.checkName;
    dataRequest.getTypeList(tbName).then(result => {
      res.send(result);
    });
  }
};

// post
const process = {
  //데이터 생성
  insert: async (req, res) => {
    const body = req.body;
    console.log(body);
    let size = [];
    try {
      if (typeof body.colName == "string") {
        body.colName = body.colName.split();
        body.colType = body.colType.split();
        body.dataSize = body.dataSize.split();
        body.allowNull = body.allowNull.split();
        body.attribute = body.attribute.split();
      }
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
        await analysis_list.create({ al_name: body.tableName, al_ns: body.nameSpace, al_des: body.description, al_version: body.version, al_context: body.context }).then(async (result) => {
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
            temp = { name: body.colName[i], isRequired: nullTF, attributeType: body.attribute[i], maxLength: body.dataSize[i], valueType: body.colType[i] };
            column.push(JSON.parse(JSON.stringify(temp)));
          }
          //데이터 생성요청
          dataRequest.insert(result, conList, column);
          res.redirect("/new/list");
        });
      } else {
        res.render("newAnaly/n_insert", { blank: "nullPointException" });
      }
    } catch (err) {
      console.log("data insert failed");
      console.log(err);
    }
  },
  //테이블 소프트 삭제
  tbSofeDel: async (req, res) => {
    let analyId = req.params.al_id;
    try {
      await analysis_list
        .findOne({ where: { al_id: analyId } })
        .then(async (result) => {
          const name = result.al_name;
          //데이터 삭제 요청
          dataRequest.delOne(result);
          console.log("data delete request succeed");
          await analysis_list.update({ al_name: "deleted_" + name, al_delYn: "Y" }, { where: { al_id: analyId } });
        })
        .then((result) => {
          console.log("data soft delete succeed");
          res.redirect("/new/list/");
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
          for (var i = 0; i < nameList.length; i++) {
            //데이터 삭제 요청
            //dataRequest.delList(nameList[i],nsList[i],verList[i]);
            await analysis_list.update({ al_name: "deleted_" + nameList[i], al_delYn: "Y" }, { where: { al_id: idList[i] } });
          }
          res.redirect("/new/list");
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
      }else if(typeof body.colId == "string"){ // 새로만드는 컬럼이 많은 경우 다른 값은 배열이어도 id값은 string 일 수 있기 때문에 따로 확인
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
          await column_tb
            .create({
              al_id_col: analyId,
              attributeType: body.attribute[i],
              data_type: body.colType[i],
              data_size: size[i],
              column_name: body.colName[i],
              allowNull: body.allowNull[i],
            }) 
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
      res.redirect("/new/view/" + analyId);
    } catch (err) {
      console.log("Data update failed");
      console.log(err);
    }
  },
};

module.exports = {
  output,
  process,
  paging
};
