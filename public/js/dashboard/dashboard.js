// Client socket instance create
const socket = io();
// function setCookie(cName, cValue, cDay) {
//   var expire = new Date();
//   expire.setDate(expire.getDate() + cDay);
//   cookies = cName + "=" + escape(cValue) + "; path=/ ";
//   if (typeof cDay != "undefined") cookies += ";expires=" + expire.toGMTString() + ";";
//   document.cookie = cookies;
// }

// function getCookie(name) {
//   var nameOfCookie = name + "=";
//   var x = 0;
//   while (x <= document.cookie.length) {
//     var y = x + nameOfCookie.length;
//     if (document.cookie.substring(x, y) == nameOfCookie) {
//       if ((endOfCookie = document.cookie.indexOf(";", y)) == -1) endOfCookie = document.cookie.length;
//       return unescape(document.cookie.substring(y, endOfCookie));
//     }
//     x = document.cookie.indexOf(" ", x) + 1;
//     if (x == 0) break;
//   }
//   return "없어";
// }
// // setCookie("test","test","123")
// socket.on("로그인 유저 정보 GET", (data) => {
//   console.log(data);
// });
//const user = getCookie("user_id");
const user = document.querySelector("#userIdInfo").innerText;
console.log(user) // cookie 동작이 안되면 이걸로 하자
socket.emit("widget_onload", user);
socket.on("widget_loaded", (data) => {
  make_chart(data);
});
const dataset_type = document.querySelector("#dataset_type");
const dataset_select_box = document.querySelector("#data_select");
const regi_widget = document.querySelector(".register-widget");
const data_checkbox = document.querySelector("#dataset_data_checkbox");
// GET raw Dataset
const dataset_load = async (data) => {
  let dataset = await fetch(`/dashboard/dataset_load/${data}`).then((res) => res.json());
  return dataset.data;
};
const data_load = async (data) => {
  let dataset_data = await fetch(`/dashboard/data_load/${data}`).then((res) => res.json());
  return dataset_data.data;
};
const attr_load = async (data) => {
  let datamodel_attr = await fetch(`/dashboard/attr_load/${data}`).then((res) => res.json());
  return datamodel_attr.data;
};
const dataset_list_load = () => {
  try {
    dataset_type_value = document.getElementsByName("dataset_type")[0].value;
    var selected_dataset_type = "";
    dataset_type_value === "원천데이터" ? (selected_dataset_type = "raw_data") : (selected_dataset_type = "processed_data");
    let loaded_data = dataset_load(selected_dataset_type);
    loaded_data.then((data_array) => {
      let html_contents = new Array();
      for (let i = 0; i < data_array.length; i++) {
        if (i == 0) {
          html_contents.push(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion} selected >${data_array[i].key}</option>`);
        } else {
          html_contents.push(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion}>${data_array[i].key}</option>`);
        }
      }
      dataset_select_box.innerHTML = html_contents.join("");
      dataset_data_list_load();
    });
  } catch (err) {
    console.log(err);
  }
};
var wrapper = document.getElementById("wrapper");
const dataset_data_list_load = () => {
  try {
    let valArr = dataset_select_box.value.split(",");
    let defineUri = `Type=${valArr[2]}.${valArr[1]}:${valArr[3]}&datasetId=${valArr[0]}`;
    document.getElementsByName("dataset_name")[0].value = valArr[0];
    console.log("get loaded data : " + defineUri);
    const data_list = data_load(defineUri);
    data_list.then((data_array) => {
      if (data_array == "error") {
        alert("해당 dataset에 적재된 data가 없습니다 다른 dataset을 선택해주세요");
        data_checkbox.innerHTML = "";
      } else {
        let html_contents = new Array();
        for (let i = 0; i < data_array.length; i++) {
          var unique_id = `${data_array[i]}_${i}`;
          html_contents.push(
            `<div class="item-box">
            <input type="checkbox" name="data_id" id="${unique_id}" value="${data_array[i]}"/>
            <label for="${unique_id}"><span class="check-ico"></span>${data_array[i]}</label>
          </div>`
          );
        }
        data_checkbox.innerHTML = html_contents.join("");
        wrapper.innerHTML = "";
        datamodel_attr_load();
      }
    });
  } catch (err) {
    console.log(err);
  }
};
var data = {};
var keyName = ["name", "objectMembers", "childAttributes"];
const datamodel_attr_load = () => {
  try {
    wrapper.innerHTML = "";
    let valArr = dataset_select_box.value.split(",");
    let uri = `type=${valArr[1]}&namespace=${valArr[2]}&version=${valArr[3]}`;
    console.log("get datamodel : " + uri);
    const attrList = attr_load(uri);
    attrList.then((data_array) => {
      for (var i = 0; i < data_array.length; i++) {
        var objKey = Object.keys(data_array[i]);
        for (var j = 0; j < objKey.length; j++) {
          if (!keyName.includes(objKey[j])) {
            delete data_array[i][objKey[j]];
          }
        }
      }
      data["attribute"] = data_array;
      treeViewTest(data);
    });
    //treeBox.innerHTML = htmlCode;
  } catch (err) {
    console.log(err);
  }
};
dataset_type.addEventListener("change", (e) => {
  dataset_list_load();
  if(e.target.value=="분석데이터"){
    console.log(e.target.value)
    // document.getElementById('processedBox').style.display == 'block'
    // document.getElementById('sourceBox').style.display == 'none' 
    $('#sourceBox').css('display','none') 
    $('#processedBox').css('display','block') 
  }else{
    $('#sourceBox').css('display','block') 
    $('#processedBox').css('display','none') 
    // document.getElementById('processedBox').style.display == 'none' 
    // document.getElementById('sourceBox').style.display == 'block'
  }
});
regi_widget.addEventListener("click", async () => {
  document.getElementById("widgetFrm").reset();
  dataset_list_load();
});
dataset_select_box.addEventListener("change", () => {
  dataset_data_list_load();
});
var check_arr = new Array();
function treeViewTest(data) {
  // Create node tree view
  var data_attributes = data.attribute;
  data_attributes.map((item) => {
    tree = jsonTree.create(item, wrapper);
  });
  // // Upsert key select
  const upsert_position_select = (e) => {
    try {
      if (e.target.checked) {
        if (!check_arr.includes(e.target.value)) {
          check_arr.push(e.target.value);
        }
        // console.log(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode)
      } else {
        check_arr = check_arr.filter((item) => e.target.value != item);
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  // Create checkbox for attribute name identify
  var node_list = document.getElementsByClassName("jsontree_node");
  for (let i = 0; i < node_list.length; i++) {
    var node_list_childNodes = node_list[i].childNodes;
    if (node_list_childNodes.length == 4) {
      var node_list_label = node_list_childNodes[1]; // span.jsontree_label-wrapper
      var node_list_value = node_list_childNodes[3]; // span.jsontree_value-wrapper
      if (node_list_label.outerText.trim() == '"name" :') {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = node_list_value.innerText;
        checkbox.name = "load_attr";
        checkbox.value = node_list_value.innerText.replace(/\"/gi, "");
        checkbox.addEventListener("change", upsert_position_select);
        node_list_value.insertBefore(checkbox, node_list_value.childNodes[0]);
      }
    }
  }
}
const register = document.querySelector(".register-btn");
register.addEventListener("click", () => {
  var formSerializeArray = $("#widgetFrm").serializeArray();
  var object = {};
  for (var i = 0; i < formSerializeArray.length; i++) {
    if (Object.keys(object).includes(formSerializeArray[i]["name"])) {
      object[formSerializeArray[i]["name"]] += `,${formSerializeArray[i]["value"].trim()}`;
    } else {
      object[formSerializeArray[i]["name"]] = formSerializeArray[i]["value"].trim();
    }
  }
  var json = JSON.stringify(object);
  json = JSON.parse(json);
  json["user_id"] = user
  socket.emit("widget_register", json);
});
socket.on("registered_data", (data) => {
  console.log(`=====================${Object.keys(data)}=================`);
  make_chart(data);
});
