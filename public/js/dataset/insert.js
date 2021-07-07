var idCheck = false;
function dupCheck() {
  var id = document.getElementsByName("dataset_id")[0];
  if (id.value == "") {
    window.alert("ID를 입력해주세요");
    return "#";
  } else {
    fetch(`/ds/duplication/check/${id.value}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data == true) {
          window.alert("사용 불가능한 아이디 입니다.");
          id.value = "";
          id.focus();
        } else {
          window.alert("사용 가능한 아이디 입니다.");
          idCheck = true;
          id.readOnly = true;
          id.style.backgroundColor = "#E5E5E5";
          id.style.color = "#A5A5A5";
          id.style.borderColor = "#E5E5E5";
          document.getElementsByName("dupBtn")[0].disabled = true;
        }
      });
  }
}
function showAl() {
  var temp = document.getElementsByName("dataIdName")[0].value;
  var idVer = temp.split(",");
  fetch(`/ds/getNsVer/${idVer[0]}`)
    .then((res) => res.json())
    .then((data) => {
      var ns = document.getElementById("selectedNs");
      var ver = document.getElementById("selectedVer");
      ns.innerHTML = `└SELECTED DATAMODEL NAMESPACE : <input type="text" name="dataModelNamespace" value="${data.al_ns}" readonly />`;
      ver.innerHTML = `└SELECTED DATAMODEL VERSION : <input type="text" name="dataModelVersion" value="${data.al_version}" readonly/>`;
    });
  document.getElementsByName("al_id")[0].value = idVer[0];
  document.getElementsByName("dataModelType")[0].value = idVer[1];
}
function goSubmit() {
  if (idCheck == false) {
    alert("id 중복확인을 진행해주세요");
    return "#";
  }
  var value = [];
  $("#reFrm")
    .find("input[type=text],input[type=hidden],input[type=number]")
    .each(function (index, item) {
      if ($(this).val() != "") {
        value.push($(this).attr("name"));
      }
    });
  value.push("qualityCheckEnabled");
  $("#valArr").val(value);
  console.log($("#valArr").val());
  $("#reFrm").submit();
}
