var typeCheck = false;
var cnt = 1;
function editChk() {
  console.log(`{{analysis.al_id}}`);
}
function pushCon(){
  var inputData = document.getElementsByName("plusCon")[0];
  var context = document.getElementsByName("context")[0]
  if(inputData.value==""){
    window.alert("context를 입력해주세요");
    return "#";
  }
  var show = document.getElementById("conList")
  var temp = document.createElement("p")
  temp.setAttribute("id","conLi"+cnt)
  temp.innerHTML = `<span id="con${cnt}">${inputData.value}</span> <input type="button" value="삭제" onclick="conDel(${cnt})"/>`
  show.appendChild(temp);
  cnt++;
  if(context.value!=""){
    context.value += `,${inputData.value}`
  }else{
    context.value += inputData.value
  }
  inputData.value = "";
}
function conDel(id){
  console.log(document.getElementById(`con${id}`).innerHTML)
}
function dupCheck() {
  var type = document.getElementsByName("type")[0];
  if (type.value == "") {
    window.alert("테이블 타입을 입력해주세요");
    return "#";
  } else {
    fetch(`/analysis/duplication/check/${type.value}`)
      .then((res) => res.json())
      .then((data) => {
        if (data == true) {
          window.alert("사용 불가능한 테이블 타입입니다.");
          type.value = "";
          type.focus();
        } else {
          window.alert("사용 가능한 테이블 타입입니다.");
          typeCheck = true;
          type.readOnly = true;
          type.style.backgroundColor = "#E5E5E5";
          type.style.color = "#A5A5A5";
          type.style.borderColor = "#E5E5E5";
          document.getElementsByName("dupBtn")[0].disabled = true;
        }
      });
  }
}
//Row 추가

function attrChange(idx) {
  var elements = document.getElementsByName(idx.name);
  var valueType = document.getElementsByName("valueType");
  console.log(idx.parentElement)
  var v = document.getElementsByName("vEnum");
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == idx) {
      if (elements[i].value == "GeoProperty") {
        valueType[i].innerHTML = " <option value='GeoJson'>GeoJson</option>";
        v[0].style.display="none"
        v[1].style.display="none"
      } else if (elements[i].value == "Relationship") {
        valueType[i].innerHTML = " <option value='String'>STRING</option>";
        v[0].style.display="block"
        v[1].style.display="block"
      } else {
        valueType[i].innerHTML = "<option value='String'>STRING</option><option value='Integer'>INTEGER</option>" + "<option value='Double'>DOUBLE</option> <option value='Object'>OBJECT</option>" + "<option value='Date'>DATE</option><option value='ArrayString'>ARRAY STRING</option>" + "<option value='ArrayInteger'>ARRAY INTEGER</option> <option value='ArrayDouble'>ARRAY DOUBLE</option>" + "<option value='ArrayObject'>ARRAY OBJECT</option> ";
        v[0].style.display="block"
        v[1].style.display="block"
      }
      break;
    }
  }
}
function goSubmit() {
  // if (typeCheck == false) {
  //   window.alert("테이블 타입 중복 체크를 진행해주세요");
  //   return "#";
  // }
  var frm = document.register;
  frm.version.value = frm.first.value + "." + frm.middle.value + "." + frm.last.value;
  frm.first.disabled = true;
  frm.middle.disabled = true;
  frm.last.disabled = true;
  var checkValue = document.getElementsByName("nullCheck");
  var requierd = document.getElementsByName("isRequired");
  for (var i = 0; i < checkValue.length; i++) {
    if (checkValue[i].checked) {
      requierd[i].value = "false";
    }
  }
  var obChk = document.getElementsByName("observedChk");
  var has = document.getElementsByName("hasObservedAt");
  for (var i = 0; i < checkValue.length; i++) {
    if (obChk[i].checked) {
      has[i].value = "true";
    }
  }
  // var columnName = document.getElementsByName("column_name");
  // if(document.getElementsByName("namespace")[0].value==""||document.getElementsByName("context")[0].value==""){
  //   window.alert("별표 표시된 항목은 필수 입력사항입니다. 입력 후 진행해주세요");
  //   return "#";
  // }
  // for (var i = 0; i < columnName.length; i++) {
  //   if (columnName[i].value == "") {
  //     window.alert("column name을 입력해주세요");
  //     columnName[i].focus();
  //     return "#";
  //   }
  // }
  frm.submit();
}
