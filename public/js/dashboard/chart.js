let parent_chart = document.getElementById("sortable");
let colorchip = ["255,100,141", "178,248,152", "87,196,196", "103,116,255", "160,113,255", "205,207,211", "102,102,102", "255,208,98", "69,169,237"];
// for (var i = 0; i < 5; i++) {
//   let can = document.createElement("canvas");
//   let html = document.getElementsByClassName("chart-list-item")[0].cloneNode(true);
//   html.style.display = "block";
//   let wid_title = html.children[0].children[0];
//   wid_title.innerText = `test_${i}`;
//   can.id = `test_${i}`;
//   html.appendChild(can);
//   parent_chart.insertBefore(html, null);
// }
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
  }
};

$(document).ready(function(){
  console.log("ok")
  //********* card delete start *********//
  $(".card_del").on('click', function () {
    $(this).parents(".chart-list-item").remove();
  });
  //********* card delete end *********//
  ///////////////////////////////////////

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
})