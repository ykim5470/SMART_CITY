var oTbl;
//Row 추가
function insRow() {
  oTbl = document.getElementById("addTable");
  var oRow = oTbl.insertRow();
  oRow.onmouseover = function () {
    oTbl.clickedRowIndex = this.rowIndex;
  }; //clickedRowIndex - 클릭한 Row의 위치를 확인;
  var cell1 = oRow.insertCell();
  var cell2 = oRow.insertCell();
  var cell3 = oRow.insertCell();
  var cell4 = oRow.insertCell();
  var cell5 = oRow.insertCell();
  var cell6 = oRow.insertCell();
  //삽입될 Form Tag
  var frmTag1 =
    "<select name='attribute' onchange='attrChange(this)'><option value='Property'>Property</option><option value='GeoProperty'>GeoProperty</option>" +
    "<option value='Relationship'>Relationship</option></select>";
  var frmTag2 =
    "<select name='colType' style='width:140px;'><option value='String'>STRING</option><option value='Integer'>INTEGER</option>" +
    "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" +
    "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" +
    "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" +
    "<option value='ArrayObject'>ARRAY OBJECT</option></select>";
  var frmTag3 = "<input type='text' name='dataSize' placeholder='데이터 사이즈를 입력해주세요' />";
  var frmTag4 = "<input type='text' name='colName' placeholder=' 컬럼이름을 입력하세요.' />";
  var frmTag5 = "<input type='checkbox' name='nullCheck' onclick='nullTf(this)'/><input type='hidden' name='allowNull' value='false'/>";
  var frmTag6 = "<input type=button value='삭제' onclick='removeRow()' style='cursor:hand'>";
  cell1.innerHTML = frmTag1;
  cell2.innerHTML = frmTag2;
  cell3.innerHTML = frmTag3;
  cell4.innerHTML = frmTag4;
  cell5.innerHTML = frmTag5;
  cell6.innerHTML = frmTag6;
}
//Row 삭제
function removeRow() {
  oTbl.deleteRow(oTbl.clickedRowIndex);
}
function deleteRow(idx) {
  var elements = document.getElementsByName(idx.name);
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == idx) {
      document.getElementById("addTable").deleteRow(i + 1);
      break;
    }
  }
}
function attrChange(idx) {
  var elements = document.getElementsByName(idx.name);
  var valueType = document.getElementsByName("colType");
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == idx) {
      if (elements[i].value == "GeoProperty") {
        valueType[i].innerHTML = " <option value='GeoJson'>GeoJson</option>";
      } else if (elements[i].value == "Relationship") {
        valueType[i].innerHTML = " <option value='String'>STRING</option>";
      } else {
        valueType[i].innerHTML =
          "<option value='String'>STRING</option><option value='Integer'>INTEGER</option>" +
          "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" +
          "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" +
          "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" +
          "<option value='ArrayObject'>ARRAY OBJECT</option> ";
      }
      break;
    }
  }
}
function nullTf(idx) {
  var elements = document.getElementsByName(idx.name);
  var nullVal = document.getElementsByName("allowNull");
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == idx) {
      if (nullVal[i].value == "true") {
        nullVal[i].value = "false";
      } else {
        nullVal[i].value = "true";
      }
    }
  }
}
function goSubmit() {
  var columnName = document.getElementsByName("colName");
  if (columnName.length < 1) {
    window.alert("컬럼은 하나 이상 입력해야합니다");
    return "#";
  }
  for (var i = 0; i < columnName.length; i++) {
    if (columnName[i].value == "") {
      window.alert("빈칸을 모두 입력해주세요");
      columnName[i].focus();
      return "#";
    }
  }
  var frm = document.edit;
  if (frm.editDes.value == "" || frm.editContext.value == "") {
    window.alert("빈칸을 모두 입력해주세요");
    return "#";
  } else {
    frm.editVersion.value = frm.first.value + "." + frm.middle.value + "." + frm.last.value;
    frm.submit();
  }
}
