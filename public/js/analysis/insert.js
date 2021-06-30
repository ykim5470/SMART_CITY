window.onload = function () {
  if ("{{blank}}" != "") {
    window.alert("잘못된 입력값입니다 확인하시고 다시 입력해주세요");
  }
};
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
  //삽입될 Form Tag
  var frmTag1 =
    "<select name='attribute' onchange='attrChange()'><option value='Property'>Property</option><option value='GeoProperty'>GeoProperty</option>" +
    "<option value='Relationship'>Relationship</option></select>";
  var frmTag2 =
    "<select name='colType'><option value='String'>STRING</option><option value='Integer'>INTEGER</option>" +
    "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" +
    "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" +
    "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" +
    "<option value='ArrayObject'>ARRAY OBJECT</option></select>";
  var frmTag3 = "<input type='text' name='dataSize' placeholder='데이터 사이즈를 입력해주세요' />";
  var frmTag4 = "<input type='text' name='colName' placeholder=' 컬럼이름을 입력하세요.' />";
  var frmTag5 = "<input type='checkbox' name='nullCheck' /><input type='hidden' name='allowNull' value='false'/>";
  frmTag5 += "&nbsp&nbsp<input type=button value='삭제' onClick='removeRow()' style='cursor:hand'>";
  cell1.innerHTML = frmTag1;
  cell2.innerHTML = frmTag2;
  cell3.innerHTML = frmTag3;
  cell4.innerHTML = frmTag4;
  cell5.innerHTML = frmTag5;
}
//Row 삭제
function removeRow() {
  oTbl.deleteRow(oTbl.clickedRowIndex);
}
function attrChange() {
  var valueType = document.getElementsByName("colType");
  var attrType = document.getElementsByName("attribute");
  for (var i = 0; i < valueType.length; i++) {
    if (attrType[i].value == "GeoProperty") {
      valueType[i].innerHTML = " <option value='GeoJson'>GeoJson</option>";
    } else if (attrType[i].value == "Relationship") {
      valueType[i].innerHTML = " <option value='String'>STRING</option>";
    } else {
      valueType[i].innerHTML =
        "<option value='String'>STRING</option><option value='Integer'>INTEGER</option>" +
        "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" +
        "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" +
        "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" +
        "<option value='ArrayObject'>ARRAY OBJECT</option> ";
    }
  }
}
function goSubmit() {
  var columnName = document.getElementsByName("colName");
  for (var i = 0; i < columnName.length; i++) {
    if (columnName[i].value == "") {
      window.alert("빈칸을 모두 입력해주세요");
      columnName[i].focus();
      return "#";
    }
  }
  var frm = document.register;
  if (frm.tableName.value == "" || frm.nameSpace.value == "" || frm.description.value == "" || frm.context.value == "") {
    window.alert("빈칸을 모두 입력해주세요");
    return "#";
  } else {
    frm.version.value = frm.first.value + "." + frm.middle.value + "." + frm.last.value;
    var checkValue = document.getElementsByName("nullCheck");
    for (var i = 0; i < checkValue.length; i++) {
      if (checkValue.checked) {
        frm.allowNull[i].value = "true";
      }
    }
    frm.submit();
  }
}
