let parent_chart = document.getElementById("sortable");
let colorchip = ["255,100,141", "178,248,152", "87,196,196", "103,116,255", "160,113,255", "205,207,211", "102,102,102", "255,208,98", "69,169,237"];
const lineCha = ["lineChart", "multiAxisLineChart", "steppedLineChart", "lineChartStacked", "lineStyling", "pointStyle", "gridConfiguration"];
const barCha = ["verticalBarChart", "programmaticEventTriggers", "horizontalBarChart", "stackedBarChart", "barChartBorderRadius"];
const otherCha = ["scatter", "doughnut", "pie", "polarArea", "radar"];
let config = {
  data: {
    datasets: [],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
};
let chart;
const make_chart = async (data) => {
  let widget = Object.keys(data);
  for (var i = 0; i < widget.length; i++) {
    let can = document.createElement("canvas");
    let html = document.getElementsByClassName("chart-list-item")[0].cloneNode(true);
    html.style.display = "block";
    let wid_title = html.children[0].children[0];
    wid_title.innerText = `${widget[i]}`;
    can.id = `${widget[i]}`;
    html.appendChild(can);
    parent_chart.insertBefore(html, null);
    chart_config(data[widget[i]],widget[i]);
  }
  // $(".card_del").on('click', function () {
  //   $(this).parents(".chart-list-item").remove();
  // });
};
const chart_config = (data,title) => {
  if(lineCha.includes(data.chart_type)){
    line_maker(data,title);
  }else if(barCha.includes(data.chart_type)){

  }else if(otherCha.includes(data.chart_type)){
    
  }
};

const line_maker = (data,title) =>{
  config["type"] = "line"
  chart = $(`#${title}`)
  console.log(JSON.stringify(data))
}
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
