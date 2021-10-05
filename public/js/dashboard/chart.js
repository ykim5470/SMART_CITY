let parent_chart = document.getElementById("sortable");
const chartAreaBorder = {
  id: "chartAreaBorder",
  beforeDraw(chart, args, options) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  },
};
let colorchip = [
  "0,255,255",
  "127,255,212",
  "138,43,226",
  "222,184,135",
  "95,158,160",
  "127,255,0",
  "100,149,237",
  "220,20,60",
  "0,0,139",
  "0,139,139",
  "0,100,0",
  "150,0,150",
  "255,140,0",
  "153,50,204",
  "233,150,122",
  "143,188,143",
  "47,79,79",
  "0,210,215",
  "255,20,147",
  "0,191,255",
  "34,139,34",
  "255,0,255",
  "255,215,0",
  "0,158,0",
  "255,105,180",
  "205,92,92",
  "75,0,130",
  "124,252,50",
  "173,216,230",
  "240,128,128",
  "144,238,144",
  "255,160,122",
  "32,178,170",
  "0,255,0",
  "128,0,0",
  "0,0,235",
  "186,85,211",
  "123,104,238",
  "0,250,154",
  "199,21,133",
  "255,165,0",
  "255,69,0",
  "152,251,152",
  "219,112,147",
  "102,51,153",
  "255,0,0",
  "65,105,225",
  "46,139,87",
  "135,206,235",
  "106,90,205",
  "255,99,71",
  "238,130,238",
  "255,255,0",
  "154,205,50",
];
const lineCha = ["lineChart", "multiAxisLineChart", "steppedLineChart", "lineChartStacked", "lineStyling", "pointStyle", "gridConfiguration"];
const barCha = ["verticalBarChart", "programmaticEventTriggers", "horizontalBarChart", "stackedBarChart", "barChartBorderRadius"];
const otherCha = ["scatter", "doughnut", "pie", "polarArea", "radar"];
const exceptList = ["data_type", "chart_type", "type", "modifiedAt", "name", "datasetId", "id", "widgetId", "value", "observedAt", "plugin"];
let stanCon = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
    chartAreaBorder: {
      borderColor: "red",
      borderWidth: 3,
      borderDash: [10, 10],
    },
  },
};
function RootAttribute(data) {
  let values = new Array();
  this.get_child = function (data) {
    for (el in data) {
      if (exceptList.includes(el)) {
        delete data[el];
      }
    }
    if (Object.keys(data).length > 0) {
      let s = new Object();
      for (el in data) {
        s["label"] = el;
        s["value"] = data[el].value;
        values.push(s);
      }
      this.get_child(data[el]);
    } else {
      return;
    }
  };
  this.rename = function (value) {
    let predic;
    let val;
    let dataArr = new Array();
    for (el in value) {
      if (el == "predictedAt") {
        predic = value[el];
      } else {
        val = value[el];
      }
    }
    predic.forEach((item, id) => {
      let u = new Object();
      u["x"] = item.replace(",000+09:00", "");
      u["y"] = val[id];
      dataArr.push(u);
    });
    return dataArr;
  };
  this.get_processed_data = function () {
    for (el in data) {
      if (typeof data[el] == "object" && !exceptList.includes(el)) {
        let t = new Object();
        t["label"] = el;
        t["value"] = data[el][0].value; // 순번은 나중에 지정 가능한 것으로 수정 할 것
        values.push(t);
        this.get_child(data[el][0]);
      }
    }
    for (const item of values) {
      item["data"] = this.rename(item.value);
      delete item["value"];
      item["backgroundColor"] = `rgba(${colorchip[Math.floor(Math.random() * colorchip.length)]})`;
      item["borderColor"] = item["backgroundColor"];
    }
    return values;
  };
  this.get_source_data = function () {
    for (key in data) {
      let t = new Object();
      if (!exceptList.includes(key)) {
        console.log(key);
        t["label"] = key;
        t["data"] = [];
        data[key].map((el) => {
          let ii = new Object();
          for (item in el) {
            if (item == "observedAt") {
              ii["x"] = el[item].replace(",000+09:00", "");
            } else if (item == "value") {
              ii["y"] = el[item]; // 나중에 소수점 관련 문제 있으면 parseFloat(el[item])으로 바꾸기
            }
          }
          t["data"].push(ii);
        });
        t["backgroundColor"] = `rgba(${colorchip[Math.floor(Math.random() * colorchip.length)]})`;
        t["borderColor"] = t["backgroundColor"];
        values.push(t);
      }
    }
    return values;
  };
}
const make_chart = async (data) => {
  let widget = Object.keys(data);
  for (var i = 0; i < widget.length; i++) {
    let can = document.createElement("canvas");
    let html = document.getElementsByClassName("chart-list-item")[0].cloneNode(true);
    html.style.display = "block";
    let wid_title = html.children[0].children[0];
    html.children[0].children[1].id = `${data[widget[i]].widgetId}`;
    wid_title.innerText = `${widget[i]}`;
    can.id = `${widget[i]}`;
    can.height = "301";
    html.appendChild(can);
    parent_chart.insertBefore(html, null);
    chart_config(data[widget[i]], widget[i]);
  }
  $(".card_del").on("click", function () {
    let widget_id = $(this).attr("id");
    socket.emit("widget_delete", widget_id);
    $(this).parents(".chart-list-item").remove();
    // $(this).removeClass('float-right card_del');
  });
};
const chart_config = (data, title) => {
  if (lineCha.includes(data.chart_type)) {
    line_maker(data, title);
  } else if (barCha.includes(data.chart_type)) {
  } else if (otherCha.includes(data.chart_type)) {
  }
};
const line_maker = (data, title) => {
  let thisChartCon = new Object();
  thisChartCon["data"] = {};
  thisChartCon["type"] = "line";
  thisChartCon["options"] = stanCon;
  chart = $(`#${title}`);
  console.log(data);
  for (key in data) {
    if (!exceptList.includes(key)) {
      let a = new RootAttribute(data[key]);
      let y;
      if (data.data_type === "분석데이터") {
        y = a.get_processed_data();
      } else {
        y = a.get_source_data();
      }
      console.log(y);
      thisChartCon["data"]["datasets"] = y;
    }
  }
  if (data.hasOwnProperty("plugin")) {
    if (data["plugin"] === "areaBorder") {
      thisChartCon["plugins"] = [chartAreaBorder]
    }
  }
  let makeCha = new Chart(chart, thisChartCon);
};

$(document).ready(function () {
  //********* card sortable start *********//
  $(function () {
    $("#sortable").sortable();
    $("#sortable").disableSelection();
  });
  $(function () {
    $(".item-box").find("label").tooltip();
  });
  //********* card sortable end *********//
  /////////////////////////////////////////
});
