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
const dataset_list_load = () => {
  try {
    dataset_type_value = document.getElementsByName("dataset_type")[0].value;
    var selected_dataset_type = "";
    dataset_type_value === "원천데이터" ? (selected_dataset_type = "raw_data") : (selected_dataset_type = "processed_data");
    let loaded_data = dataset_load(selected_dataset_type);
    loaded_data.then((data_array) => {
      let html_contents = new Array();
      for (let i = 0; i < data_array.length; i++) {
        if(data_array[i].key == "수자원 유량 예측 결과"){
          console.log(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion}>${data_array[i].key}</option>`)
        }
        if (i == 0) {
          html_contents.push(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion} selected >${data_array[i].key}</option>`);
        } else {
          html_contents.push(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion}>${data_array[i].key}</option>`);
        }
      }
      dataset_select_box.innerHTML = html_contents.join("");
    });
  } catch (err) {
    console.log(err);
  }
};
const dataset_data_list_load = () => {
  try {
    console.log(dataset_select_box.value)
    let valArr = dataset_select_box.value.split(",");
    let defineUri = `Type=${valArr[2]}.${valArr[1]}:${valArr[3]}&datasetId=${valArr[0]}`;
    let data_list = data_load(defineUri);
    
    data_list.then((data_array) => {
      console.log(data_array);
      let html_contents = new Array();
      for (let i = 0; i < data_array.length; i++) {
        var unique_id = `${data_array[i].value}_${i}`
        html_contents.push(
          `<div class="item-box">
            <input type="checkbox" name="dataset_data" id="${unique_id}" value="${data_array[i].value}"/>
            <label for="${unique_id}"><span class="check-ico"></span>${data_array[i].value}</label>
          </div>`
        );
      }
      data_checkbox.innerHTML = html_contents.join("");
    });
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
