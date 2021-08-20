// Client socket instance create
const socket = io();
/*
    - 데이터 타입 선택 select
    - 하위 센서 데이터 선택 select
    - API query input box; date, hour, min, sec
    - max limit 
    - attr matching input box
 */
const dataset_type = document.querySelector(".dataset_type_select_box");
const dataset_select_box = document.querySelector("#data_select");
// GET raw Dataset
const dataset_load = async (data) => {
  let dataset = await fetch(`/dashboard/dataset_load/${data}`).then((res) => res.json());
  return dataset.data;
};
const data_load = async (data) => {
  let ttt = await fetch(`/dashboard/data_load/${data}`).then((res) => res.json());
  return ttt.data;
};
dataset_type.addEventListener("change", (e) => {
  try {
    dataset_type_value = e.target.value;
    var selected_dataset_type = "";
    dataset_type_value === "원천데이터" ? (selected_dataset_type = "raw_data") : (selected_dataset_type = "processed_data");
    let loaded_data = dataset_load(selected_dataset_type);
    loaded_data.then((data_array) => {
      let html_contents = new Array();
      for (let i = 0; i < data_array.length; i++) {
        html_contents.push(`<option value=${data_array[i].value.id},${data_array[i].value.dataModelType},${data_array[i].value.dataModelNamespace},${data_array[i].value.dataModelVersion}>${data_array[i].key}</option>`);
      }
      dataset_select_box.innerHTML = html_contents.join("");
    });
  } catch (err) {
    console.log(err);
  }
});
dataset_select_box.addEventListener("change",(e)=>{
  console.log(e.target.value)
  let valArr = e.target.value.split(",");
  let defineUri = `Type=${valArr[2]}.${valArr[1]}:${valArr[3]}&datasetId=${valArr[0]}`
  let eee = data_load(defineUri);
  eee.then((data_array)=>{
    console.log(data_array)
  })
});

var timeFormat = "DD/MM/YYYY";
var config = {
  type: "line",
  data: {
    datasets: [
      {
        label: "US Dates",
        data: [
          {
            x: "01/01/2014",
            y: 15,
          },
          {
            x: "04/01/2014",
            y: 17,
          },
          {
            x: "09/01/2015",
            y: 11,
          },
          {
            x: "11/01/2015",
            y: 19,
          },
        ],
        fill: false,
        borderColor: "red",
      },
      {
        label: "UK Dates",
        data: [
          {
            x: "02/04/2014",
            y: 17,
          },
          {
            x: "03/10/2014",
            y: 20,
          },
          {
            x: "08/04/2015",
            y: 22,
          },
          {
            x: "13/10/2015",
            y: 18,
          },
        ],
        fill: false,
        borderColor: "blue",
      },
    ],
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: "Chart.js Time Scale",
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            format: timeFormat,
            tooltipFormat: "ll",
          },
          scaleLabel: {
            display: true,
            labelString: "Date",
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "value",
          },
        },
      ],
    },
  },
};

var ctx = document.getElementById("chart").getContext("2d");
var myChart = new Chart(ctx, config);
