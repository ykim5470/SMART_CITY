var colNum = 0;
function attrChange(idx) {
  var elements = document.getElementsByName(idx.name);
  var valueType = document.getElementsByName("valueType");
  console.log(idx.parentElement);
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == idx) {
      if (elements[i].value == "GeoProperty") {
        valueType[i].innerHTML = " <option value='GeoJson'>GeoJson</option>";
      } else if (elements[i].value == "Relationship") {
        valueType[i].innerHTML = " <option value='String'>STRING</option>";
      } else {
        valueType[i].innerHTML = "<option value='String'>STRING</option><option value='Integer'>INTEGER</option>" + "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" + "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" + "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" + "<option value='ArrayObject'>ARRAY OBJECT</option> ";
      }
      break;
    }
  }
}
function colCreat() {
  var colName = document.getElementsByName("col_name")[0].value;
  if (colName == "") {
    window.alert("추가할 속성 이름을 입력해주세요");
    return "#";
  }
  var colList = document.getElementById("col_list");
  colList.innerHTML += `<span id="comCol${colNum}"><input type="radio" name="selName" id="selName${colNum}" onchange="selectedCol(this)" value="${colName}"/>
                            <label for="selName${colNum}">${colName}</label> <input type="button" name="${colName}__${colNum}" onclick="delCol(this)" value="X" /></span>`;
  document.getElementsByName("col_name")[0].value = "";
  colNum++;
}
function selectedCol(id) {
  var flag = false;
  var idNum = id.id.replace("selName", "");
  var par = document.getElementById("addChild");
  var clone = document.getElementById("example").cloneNode(true);
  clone.style = "display:block;";
  clone.setAttribute("id", `formNum${idNum}`);
  clone.getElementsByTagName("table")[0].setAttribute("id", `detailCol${idNum}`);
  clone.getElementsByTagName("table")[1].setAttribute("id", `detailObj${idNum}`);
  var inputData = clone.getElementsByTagName("table")[0].getElementsByTagName("input");
  for (var i = 0; i < inputData.length; i++) {
    if (inputData[i].name == "insertObj") {
      inputData[i].setAttribute("id", `insObj${idNum}`);
    } else if (inputData[i].name == "saveCol") {
      inputData[i].setAttribute("id", `saveCol${idNum}`);
    } else if (inputData[i].name == "column_name") {
      inputData[i].value = id.value;
    }
  }
  for (var i = 0; i < par.childElementCount; i++) {
    par.children[i].style = "display : none;";
    if (par.children[i].id == `formNum${idNum}`) {
      flag = true;
      par.children[i].style = "display : block;";
    }
  }
  if (!flag) {
    document.getElementById("addChild").appendChild(clone);
  }
}
function delCol(id) {
  var idInfo = id.name.split("__")
  JSON
  var del = document.getElementById(`comCol${idInfo[1]}`);
  var delTb = document.getElementById(`formNum${idInfo[1]}`);
  var attrData = document.getElementsByName("attributes")[0].value;
  if (delTb) {
    delTb.remove();
  }
  if(attrData){
    attrData = attrData.replaceAll("},{","}/{");
    attrData = attrData.split("/")
    for(var i=0; i<attrData.length; i++){
      if(attrData[i].includes(`column_name":"${idInfo[0]}"`)){
        attrData.splice(i,1);
        i--;
      }
    }
    document.getElementsByName("attributes")[0].value = attrData;
    console.log(document.getElementsByName("attributes")[0].value)
  }
  del.remove();
}
var oTbl;
function insObj(id) {
  var idNum = id.id.replace("insObj", "");
  var inObj = `&Star; Object Name <input type="text" name="objName" /> 값 유형 
          <select name="objType" style="width: 140px" >
            <option value="String">STRING</option>
            <option value="Integer">INTEGER</option>
            <option value="Double">DOUBLE</option>
            <option value="Object">OBJECT</option>
            <option value="Date">DATE</option>
            <option value="ArrayString">ARRAY STRING</option>
            <option value="ArrayInteger">ARRAY INTEGER</option>
            <option value="ArrayDouble">ARRAY DOUBLE</option>
            <option value="ArrayObject">ARRAY OBJECT</option>
          </select>
          vlaueEnum <input type="text" name="objEnum" />
          <input type="button" onclick="delObj()" value="삭제"/>
        </tr>`;
  oTbl = document.getElementById(`detailObj${idNum}`);
  oRow = oTbl.insertRow();
  oRow.onmouseover = function () {
    oTbl.clickedRowIndex = this.rowIndex;
  };
  var cell1 = oRow.insertCell();
  cell1.innerHTML = inObj;
}
function delObj() {
  oTbl.deleteRow(oTbl.clickedRowIndex);
}
function saveObj(id) {
  // 나중에 해야하는 예외처리 >> object, array object 인 경우 objectMembers 필수
  var arr;
  var obj = {};
  var attr = document.getElementsByName("attributes")[0].value
  attr.length>0 ? arr=attr.split() : arr=[]
  var idNum = id.id.replace("saveCol", "");
  var data = $(`#formNum${idNum}`).serializeArray();
  $.each(data, function(){
    if(obj[this.name]==undefined){
      this.value==""? (this.value="") : this.value
      obj[this.name] = this.value;
    }else{
      if(typeof obj[this.name] == "string"){
        obj[this.name] = [obj[this.name]]
      }
      obj[this.name].push(this.value)
    }
  })
  arr.push(JSON.stringify(obj))
  document.getElementsByName("attributes")[0].value = arr;
  var par = document.getElementById(`formNum${idNum}`);
  var inputData = par.getElementsByTagName("input");
  var selectData = par.getElementsByTagName("select");
  for (var i = 0; i < inputData.length; i++) {
    inputData[i].disabled = true;
  }
  for (var i = 0; i < selectData.length; i++) {
    selectData[i].disabled = true;
  }
}
function goSubmit() {
  var frm = document.register;
  frm.version.value = frm.first.value + "." + frm.middle.value + "." + frm.last.value;
  frm.first.disabled = true;
  frm.middle.disabled = true;
  frm.last.disabled = true;
  frm.submit();
}
