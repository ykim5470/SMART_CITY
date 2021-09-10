var colorchip = ["255,100,141", "178,248,152", "87,196,196", "103,116,255", "160,113,255", "205,207,211", "102,102,102", "255,208,98", "69,169,237"];
const make_chart = async (data) => {
  for (var i = 0; i < data.length; i++) {
    // 1.1 line chart default
    console.log(data[i])
    var chart01 = $(`#${Object.keys(data[i]).toString()}`);
    var chart01_opt = new Chart(chart01, {
      type: "line",
      data: {
        datasets: [
          {
            label: "option01",
            lineTension: 0,
            data: [
              {
                x: "02/04/2014",
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
            backgroundColor: "rgba(" + colorchip[0] + ")",
          },
          {
            label: "option02",
            lineTension: 0,
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
            backgroundColor: "rgba(" + colorchip[3] + ")",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Line Chart",
          },
        },
      },
    });
  }
};
