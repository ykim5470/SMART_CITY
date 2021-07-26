const socket = io();

socket.on("테스트 API", (data) => {
  console.log(data);
  const var1 = new Array
  var variable1 = data.intakeVolume;
  var variable2 = data.energyConsumption;
  console.log(variable1)
  variable1.filter((el) => {
      return el.observedAt
  });
  console.log(variable1)
});


var timeFormat = 'DD/MM/YYYY';
var config = {
    type:    'line',
    data:    {
        datasets: [
            {
                label: "US Dates",
                data: [{
                    x: "01/01/2014", y: 15
                }, {
                    x: "04/01/2014", y: 17
                }, {
                    x: "09/01/2015", y: 11
                }, {
                    x: "11/01/2015", y: 19
                }],
                fill: false,
                borderColor: 'red'
            },
            {
                label: "UK Dates",
                data:  [{
                    x: "02/04/2014", y: 17
                }, {
                    x: "03/10/2014", y: 20
                }, {
                    x: "08/04/2015", y: 22
                }, {
                    x: "13/10/2015", y: 18
                }],
                fill:  false,
                borderColor: 'blue'
            }
        ]
    },
    options: {
        responsive: true,
        title:      {
            display: true,
            text:    "Chart.js Time Scale"
        },
        scales:     {
            xAxes: [{
                type:       "time",
                time:       {
                    format: timeFormat,
                    tooltipFormat: 'll'
                },
                scaleLabel: {
                    display:     true,
                    labelString: 'Date'
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display:     true,
                    labelString: 'value'
                }
            }]
        }
    }
};

var ctx = document.getElementById("chart").getContext("2d");
var myChart = new Chart(ctx,config)