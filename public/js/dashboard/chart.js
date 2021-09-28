let parent_chart = document.getElementById("sortable");
let colorchip = [
  '0,255,255','127,255,212','138,43,226','222,184,135','95,158,160','127,255,0','100,149,237','220,20,60','0,0,139','0,139,139','0,100,0',
  '150,0,150','255,140,0', '153,50,204','233,150,122','143,188,143','47,79,79','0,210,215','255,20,147','0,191,255','34,139,34','255,0,255',
  '255,215,0','0,158,0','255,105,180','205,92,92','75,0,130','124,252,50','173,216,230','240,128,128','144,238,144','255,160,122','32,178,170',
  '0,255,0','128,0,0','0,0,235','186,85,211','123,104,238', '0,250,154','199,21,133','255,165,0','255,69,0','152,251,152','219,112,147',
  '102,51,153','255,0,0','65,105,225','46,139,87','135,206,235','106,90,205','255,99,71','238,130,238','255,255,0','154,205,50'
];
const lineCha = ["lineChart", "multiAxisLineChart", "steppedLineChart", "lineChartStacked", "lineStyling", "pointStyle", "gridConfiguration"];
const barCha = ["verticalBarChart", "programmaticEventTriggers", "horizontalBarChart", "stackedBarChart", "barChartBorderRadius"];
const otherCha = ["scatter", "doughnut", "pie", "polarArea", "radar"];
let exceptList  = ["data_type","chart_type","type","modifiedAt","name","datasetId","id","widgetId"]
let stanCon = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
const lineRename_source = (data) => {
  const newObj = {}
  for (const key in data) {
    if(key == "observedAt"){
      data[key] = data[key].replace(",000+09:00","")
      newObj["x"] = data[key]
    }else if(key =="value"){
      newObj["y"] = parseFloat(data[key])
    }
  }
  return newObj
}
const make_chart = async (data) => {
  let widget = Object.keys(data);
  for (var i = 0; i < widget.length; i++) {
    let can = document.createElement("canvas");
    let html = document.getElementsByClassName("chart-list-item")[0].cloneNode(true);
    html.style.display = "block";
    let wid_title = html.children[0].children[0];
    html.children[0].children[1].id = `${data[widget[i]].widgetId}`
    wid_title.innerText = `${widget[i]}`;
    can.id = `${widget[i]}`;
    html.appendChild(can);
    parent_chart.insertBefore(html, null);
    chart_config(data[widget[i]],widget[i]);
  }
  $(".card_del").on('click', function () {
    let widget_id = $(this).attr("id");
    socket.emit("widget_delete",widget_id);
    $(this).parents(".chart-list-item").remove();
    // $(this).removeClass('float-right card_del');
  });
};
const chart_config = (data,title) => {
  if(lineCha.includes(data.chart_type)){
    line_maker(data,title);
  }else if(barCha.includes(data.chart_type)){

  }else if(otherCha.includes(data.chart_type)){
    
  }
};
let thisChartCon = new Object();
let temp = new Object();
const line_maker = (data,title) =>{
  thisChartCon = {};
  thisChartCon["data"] = {}
  thisChartCon["data"]["datasets"] =[]
  thisChartCon["type"] = "line"
  thisChartCon["options"] = stanCon
  chart = $(`#${title}`)
  for(key in data){
    if(!exceptList.includes(key)){
      for(kkey in data[key]){
        temp = {};
        if(!exceptList.includes(kkey)){
          temp["label"] = `_${kkey}`;
          temp['data'] = [];
        data[key][kkey].map((el)=>{
          let ii = lineRename_source(el)
          temp['data'].push(ii)
        })
        let iiiii = colorchip[Math.floor(Math.random()*colorchip.length)]
        temp["backgroundColor"] = `rgba(${iiiii})`
        temp["borderColor"] = temp["backgroundColor"]
        thisChartCon["data"]["datasets"].push(temp);
        }
      }
    }
  }
  console.log(thisChartCon)
  let dsaf = new Chart(chart,thisChartCon)
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
