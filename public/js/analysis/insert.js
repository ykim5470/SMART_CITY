var oTbl;
var nameCheck = false;
function dupCheck() {
  var tbName = document.getElementsByName("tableName")[0];
  if (tbName.value == "") {
    window.alert("테이블명을 입력해주세요");
    return "#";
  } else {
    fetch(`/new/duplication/check/${tbName.value}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data == true) {
          window.alert("사용 불가능한 테이블명입니다.");
          tbName.value = "";
          tbName.focus();
        } else {
          window.alert("사용 가능한 테이블명입니다.");
          nameCheck = true;
          tbName.readOnly = true;
          tbName.style.backgroundColor = "#E5E5E5";
          tbName.style.color = "#A5A5A5";
          tbName.style.borderColor = "#E5E5E5";
          document.getElementsByName("dupBtn")[0].disabled = true;
        }
      });
  }
}
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
function goSubmit() {
  if (nameCheck == false) {
    window.alert("테이블명 중복 체크를 진행해주세요");
    return "#";
  }
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
    var nullValue = document.getElementsByName("allowNull");
    for (var i = 0; i < checkValue.length; i++) {
      if (checkValue[i].checked) {
        nullValue[i].value = "true";
      }
    }
    frm.submit();
  }
}
