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
const quadrants = {
  id: "quadrants",
  beforeDraw(chart, args, options) {
    const {
      ctx,
      chartArea: { left, top, right, bottom },
      scales: { x, y },
    } = chart;
    const midX = x.getPixelForValue(0);
    const midY = y.getPixelForValue(0);
    ctx.save();
    ctx.fillStyle = options.topLeft;
    ctx.fillRect(left, top, midX - left, midY - top);
    ctx.fillStyle = options.topRight;
    ctx.fillRect(midX, top, right - midX, midY - top);
    ctx.fillStyle = options.bottomRight;
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    ctx.fillStyle = options.bottomLeft;
    ctx.fillRect(left, midY, midX - left, bottom - midY);
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
const exceptList = ["data_type", "chart_type", "type", "modifiedAt", "name", "datasetId", "id", "widgetId", "value", "observedAt", "plugin", "location", "load_attr", "turn_num"];
const multiAxisCon = {
  y: {
    type: "linear",
    display: true,
    position: "left",
  },
  y1: {
    type: "linear",
    display: true,
    position: "right",
    grid: { drawOnChartArea: false },
  },
};
const gridCon = {
  x: {
    grid: {
      display: true,
      drawBorder: true,
      drawOnChartArea: true,
      drawTicks: true,
    },
  },
  y: {
    grid: {
      drawBorder: false,
      color: function (context) {
        if (context.tick.value > 0) {
          return `rgba(255, 50, 59)`;
        } else if (context.tick.value < 0) {
          return `rgba(42, 50, 255)`;
        }
        return "#000000";
      },
    },
  },
};
function Attribute(data) {
  let values = new Array();
  // this.get_title = function (limit) {
  //   for (el in data) {
  //     if (typeof data[el] == "object" && !exceptList.includes(el)) {
  //       if (data[el].length < limit) {
  //         return "none data";
  //       }else{
  //         return data[el][0]["observedAt"];
  //       }
  //     }
  //   }
  // };
  this.label = function (data) {
    for (var x in data) {
      if (x != "predictedAt") {
        return x;
      }
    }
  };
  this.get_child = function (data) {
    for (el in data) {
      if (exceptList.includes(el)) {
        delete data[el];
      }
    }
    if (Object.keys(data).length > 0) {
      let s = new Object();
      for (el in data) {
        let label = (s["label"] = this.label(data[el].value));
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
      let timeset = item.split(",")
      u["x"] = timeset[0];
      u["y"] = val[id];
      dataArr.push(u);
    });
    return dataArr;
  };
  this.get_processed_data = function (limit) {
    for (el in data) {
      if (typeof data[el] == "object" && !exceptList.includes(el)) {
        let t = new Object();
        if (data[el].length < limit) {
          return "none data";
        }
        t["label"] = this.label(data[el][limit].value);
        t["value"] = data[el][limit].value;
        values.push(t);
        this.get_child(data[el][limit]);
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
        t["label"] = key;
        t["data"] = [];
        data[key].map((el) => {
          let ii = new Object();
          for (item in el) {
            if (item == "observedAt") {
              let timeset = el[item].split(",")
              ii["x"] = timeset[0];
            } else if (item == "value") {
              ii["y"] = el[item]; // 나중에 소수점 관련 문제 있으면 parseFloat(el[item])으로 바꾸기
            }
          }
          t["data"].push(ii);
        });
        t["data"] = t["data"].reverse();
        t["backgroundColor"] = `rgba(${colorchip[Math.floor(Math.random() * colorchip.length)]})`;
        t["borderColor"] = t["backgroundColor"];
        values.push(t);
      }
    }
    return values;
  };
}
const polarData = (data) => {
  let result = new Object();
  result["labels"] = [];
  result["data"] = [];
  result["backgroundColor"] = [];
  if (data.length > 0) {
    let id = data[0].data.length - 1;
    for (const item of data) {
      result["labels"].push(item["label"]);
      result["data"].push(item["data"][id].y);
      result.backgroundColor.push(item["backgroundColor"]);
    }
    result["title"] = data[0].data[id].x;
    return [result];
  }
  return [];
};
const make_chart = async (data) => {
  let widget = Object.keys(data);
  console.log(widget)
  for (var i = 0; i < widget.length; i++) {
    let can = document.createElement("canvas");
    let html = document.getElementsByClassName("chart-list-item")[0].cloneNode(true);
    html.style.display = "block";
    let wid_title = html.children[0].children[0];
    html.children[0].children[1].id = `${data[widget[i]].widgetId}`;
    wid_title.innerText = `${widget[i]}`;
    can.id = `${data[widget[i]].widgetId.replace(/-/g,"")}`;
    can.height = "301";
    html.appendChild(can);
    parent_chart.insertBefore(html, null);
    chart_maker(data[widget[i]], data[widget[i]].widgetId.replace(/-/g,""));
    function reload() {
      var modalOpen = {
        display: "block",
        "z-index": "1000",
        opacity: 1,
      };
      var modalClose = {
        display: "none",
        "z-index": "-1",
        opacity: 0,
      };
      function fixedBody() {
        $("body").css({ overflow: "hidden", "padding-right": "15px" });
      }
      function nonfixedBody() {
        $("body").css({ overflow: "auto", "padding-right": "" });
      }
      // 대시보드 - 위젯02
      var widgetBtn02 = $(".js-widget-btn02");
      widgetBtn02.on("click", function () {
        console.log("dodo");
        var widgetModal = $('[data-layer="modal-widget02"]'),
          alertCloseBtn = $('[data-role="layerClose"]');
        widgetModal.css(modalOpen);
        fixedBody();
        alertCloseBtn.on("click", function () {
          widgetModal.css(modalClose);
          nonfixedBody();
        });
      });
    }
    reload();
  }
  $(".card_del").on("click", function () {
    let widget_id = $(this).attr("id");
    socket.emit("widget_delete", widget_id);
    $(this).parents(".chart-list-item").remove();
  });
};
const chart_maker = (data, title) => {
  let options = {
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
      quadrants: {
        topLeft: "rgba(255,191,209)",
        topRight: "rgba(173,216,255)",
        bottomRight: "rgba(184,255,203)",
        bottomLeft: "rgba(255,255,164)",
      },
    },
    stacked: false,
  };
  let thisChartCon = {};
  thisChartCon["data"] = {};
  if (lineCha.includes(data.chart_type)) {
    thisChartCon["type"] = "line";
  } else if (barCha.includes(data.chart_type)) {
    thisChartCon["type"] = "bar";
  }
  chart = $(`#${title}`);
  let y = new Array();
  for (key in data) {
    if (!exceptList.includes(key)) {
      let a = new Attribute(data[key]);
      if (data.data_type === "분석데이터") {
        let title = "";
        if (data.turn_num != undefined) {
          y = a.get_processed_data(data.turn_num);
          // console.log(a.get_title(data.turn_num))
        } else {
          y = a.get_processed_data(0);
          // console.log(a.get_title(0))
        }
      } else {
        y = a.get_source_data();
      }
    }
  }
  if (y != "none data") {
    y = y.filter((el) => data.load_attr.includes(el.label));
    switch (data.chart_type) {
      case "multiAxisLineChart":
        if (y.length == 2) {
          y[0]["yAxisID"] = "y";
          y[1]["yAxisID"] = "y1";
          options["scales"] = multiAxisCon;
        }
        break;
      case "steppedLineChart":
        for (var i = 0; i < y.length; i++) {
          y[i]["stepped"] = true;
        }
        break;
      case "lineChartStacked":
        for (var i = 0; i < y.length; i++) {
          y[i]["fill"] = true;
        }
        break;
      case "lineStyling":
        for (var i = 0; i < y.length; i++) {
          if (i % 3 == 1) {
            y[i]["borderDash"] = [5, 5];
          } else if (i % 3 == 2) {
            y[i]["fill"] = true;
          }
        }
        break;
      case "pointStyle":
        for (var i = 0; i < y.length; i++) {
          y[i]["borderWidth"] = 1;
          y[i]["pointStyle"] = "rectRot";
          y[i]["pointRadius"] = 5;
          y[i]["pointBorderColor"] = "rgb(0, 0, 0)";
        }
        break;
      case "gridConfiguration":
        options["scales"] = gridCon;
        break;
      case "programmaticEventTriggers":
        for (var i = 0; i < y.length; i++) {
          y[i]["hoverBorderWidth"] = 3;
          y[i]["hoverBorderColor"] = "rgb(0, 0, 0)";
        }
        break;
      case "horizontalBarChart":
        options["indexAxis"] = "y";
        let label = new Array();
        for (var i = 0; i < y.length; i++) {
          let value = new Array();
          let a = y[i].data;
          for (var j = 0; j < a.length; j++) {
            if (!label.includes(a[j].x)) {
              label.push(a[j].x);
            }
            value.push(a[j].y);
          }
          y[i].data = value;
        }
        thisChartCon["data"]["labels"] = label;
        break;
      case "stackedBarChart":
        options["scales"] = {
          x: { stacked: true },
          y: { stacked: true },
        };
        break;
      case "barChartBorderRadius":
        for (var i = 0; i < y.length; i++) {
          y[i].backgroundColor = y[i].backgroundColor.replace(")", ",0.6)");
          y[i]["borderWidth"] = 3;
          y[i]["borderRadius"] = Math.floor(Math.random() * 101);
          y[i]["borderSkipped"] = false;
        }
        break;
      case "polarArea":
        thisChartCon["type"] = "polarArea";
        y = polarData(y);
        if (y.length > 0) {
          thisChartCon["data"]["labels"] = y[0].labels;
          delete y[0].labels;
          y[0]["label"] = "test";
          options.plugins.legend["position"] = "top";
          options.plugins["title"] = {
            display: true,
            text: y[0].title,
          };
          delete y[0].title;
        }
        break;
      case "radar":
        thisChartCon["type"] = "radar";
        let radarLabel = new Array();
        for (var i = 0; i < y.length; i++) {
          let radarValue = new Array();
          let a = y[i].data;
          for (var j = 0; j < a.length; j++) {
            if (!radarLabel.includes(a[j].x)) {
              radarLabel.push(a[j].x);
            }
            radarValue.push(a[j].y);
          }
          y[i].data = radarValue;
          y[i].backgroundColor = y[i].backgroundColor.replace(")", ",0.5)");
        }
        thisChartCon["data"]["labels"] = radarLabel;
        break;
      case "doughnut":
        thisChartCon["type"] = "doughnut";
        options["pieceLabel"] = { mode: "label", position: "inside", fontSize: 11, fontStyle: "bold" };
        let doughLabel = new Array();
        let doughColors = new Array();
        for (var i = 0; i < y[0].data.length; i++) {
          doughColors.push(`rgba(${colorchip[Math.floor(Math.random() * colorchip.length)]})`);
        }
        for (var i = 0; i < y.length; i++) {
          let doughValue = new Array();
          let a = y[i].data;
          for (var j = 0; j < a.length; j++) {
            if (!doughLabel.includes(a[j].x)) {
              doughLabel.push(a[j].x);
            }
            doughValue.push(a[j].y);
          }
          y[i].backgroundColor = doughColors;
          y[i].borderColor = "rgba(255,255,255)";
          y[i].data = doughValue;
        }
        thisChartCon["data"]["labels"] = doughLabel;
        break;
      case "pie":
        thisChartCon["type"] = "pie";
        options["pieceLabel"] = { mode: "label", position: "inside", fontSize: 11, fontStyle: "bold" };
        let pieLabel = new Array();
        let pieColors = new Array();
        for (var i = 0; i < y[0].data.length; i++) {
          pieColors.push(`rgba(${colorchip[Math.floor(Math.random() * colorchip.length)]})`);
        }
        for (var i = 0; i < y.length; i++) {
          let pieValue = new Array();
          let a = y[i].data;
          for (var j = 0; j < a.length; j++) {
            if (!pieLabel.includes(a[j].x)) {
              pieLabel.push(a[j].x);
            }
            pieValue.push(a[j].y);
          }
          y[i].backgroundColor = pieColors;
          y[i].borderColor = "rgba(255,255,255)";
          y[i].data = pieValue;
        }
        thisChartCon["data"]["labels"] = pieLabel;
        break;
    }
    if (y.length <= 0) {
      thisChartCon["data"]["datasets"] = [];
      options.plugins.legend["position"] = "top";
      options.plugins["title"] = {
        display: true,
        text: "none data",
      };
    } else {
      thisChartCon["data"]["datasets"] = y;
    }
    if (data.hasOwnProperty("plugin")) {
      if (data["plugin"] === "areaBorder") {
        thisChartCon["plugins"] = [chartAreaBorder];
      }
      // if (data["plugin"] === "quadrants") {
      //   thisChartCon["plugins"] = [quadrants];
      // }
    }
  } else {
    thisChartCon["data"]["datasets"] = [];
    options.plugins.legend["position"] = "top";
    options.plugins["title"] = {
      display: true,
      text: "none data",
    };
  }
  thisChartCon["options"] = options;
  console.log(thisChartCon);
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
