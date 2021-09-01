// Client socket instance create
// const socket = io();
/*
    - 데이터 타입 선택 select
    - 하위 센서 데이터 선택 select
    - API query input box; date, hour, min, sec
    - max limit 
    - attr matching input box
 */
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
    console.log("get loaded data : " + defineUri);
    const data_list = data_load(defineUri);
    data_list.then((data_array) => {
      if (data_array == "error") {
        alert("해당 dataset에 적재된 data가 없습니다 다른 dataset을 선택해주세요");
        data_checkbox.innerHTML = "";
      } else if (data_array == "undefined") {
        alert("data가 잘 못 적재되었습니다. 확인 후 다시 시도해 주세요");
        data_checkbox.innerHTML = "";
      } else {
        let html_contents = new Array();
        for (let i = 0; i < data_array.length; i++) {
          var unique_id = `${data_array[i].value}_${i}`;
          html_contents.push(
            `<div class="item-box">
            <input type="checkbox" name="dataset_data" id="${unique_id}" value="${data_array[i].value}"/>
            <label for="${unique_id}"><span class="check-ico"></span>${data_array[i].value}</label>
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
      console.log(JSON.stringify(data));
    });
    //treeBox.innerHTML = htmlCode;
  } catch (err) {
    console.log(err);
  }
};
dataset_type.addEventListener("change", () => {
  dataset_list_load();
});
regi_widget.addEventListener("click", async () => {
  dataset_list_load();
});
dataset_select_box.addEventListener("change", () => {
  dataset_data_list_load();
});

function treeViewTest(data) {
  var check_arr = new Array();
  // Create node tree view
  var data_attributes = data.attribute;
  data_attributes.map((item) => {
    tree = jsonTree.create(item, wrapper);
  });
  // // Upsert key select
  const upsert_position_select = (e) => {
    try {
      if (e.target.checked) {
        check_arr.push(e.target);
      } else {
        check_arr = check_arr.filter((item) => e.target != item);
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
        checkbox.addEventListener("change", upsert_position_select);
        node_list_value.insertBefore(checkbox, node_list_value.childNodes[0]);
        if (checkbox.checked) {
          check_arr.push(checkbox);
        }
      }
    }
  }
}
