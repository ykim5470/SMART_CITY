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

dataset_type.addEventListener("change", (e) => {
  try {
    dataset_type_value = e.target.value;
    var selected_dataset_type = "";
    switch (dataset_type_value) {
      case "원천데이터":
        selected_dataset_type = "raw_data";
        dataset_select(selected_dataset_type);
        break;
      case "가공데이터":
        selected_dataset_type = "processed_data";
        dataset_select(selected_dataset_type);
        break;
      default:
        return;
    }
  } catch (err) {
    console.log(err);
  }
});

// GET raw Dataset
const raw_dataset_load = async () => {
  let raw = await fetch("/dashboard/raw_data_load").then((res) => res.json());
  return raw.data;
};

// GET Processed Dataset
const processed_dataset_load = async () => {
  let processed = await fetch("/dashboard/processed_data_load").then((res) =>
    res.json()
  );
  console.log(processed);
  return processed.data;
};

let connection

async function connect() {
  connection = await raw_dataset_load()
if (connection) {
  return connection;
} else {
  return null;
}
}
console.log(connect())



// Render dataset select box
const dataset_select = (selected_dataset_type) => {
  try {
    if (selected_dataset_type === "raw_data") {
      let loaded_data = raw_dataset_load();
      loaded_data.then((raw_data_array) => {
        let html_contents = new Array
        for (let i = 0; i < raw_data_array.length; i++) {
         html_contents.push(`<option value=${raw_data_array[i].value.id},${raw_data_array[i].value.dataModelType},${raw_data_array[i].value.dataModelNamespace},${raw_data_array[i].value.dataModelVersion}>${raw_data_array[i].key}</option>`)
        }
        dataset_select_box.innerHTML = html_contents.join('')
      });
    } else if (selected_dataset_type === "processed_data") {
      let loaded_data = processed_dataset_load();
      loaded_data.then((raw_data_array) => {
        let html_contents = new Array
        for (let i = 0; i < raw_data_array.length; i++) {
         html_contents.push(`<option value=${raw_data_array[i].value.id},${raw_data_array[i].value.dataModelType},${raw_data_array[i].value.dataModelNamespace},${raw_data_array[i].value.dataModelVersion}>${raw_data_array[i].key}</option>`)
        }
        dataset_select_box.innerHTML = html_contents.join('')
      });
      
    } else {
      throw new Error("데이터 타입선택 필요");
    }
  } catch (err) {
    console.log(err);
  }
};

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
