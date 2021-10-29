// 자동차 연비 예측 데이터
import * as fs from "fs";
import moment from "moment";
import fetch from "node-fetch";


// 데이터 분석용
// READ data
fs.readFile("./차량 예측 원본 데이터 샘플.csv", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  // 데이터 업데이트 by 5 sec
  for (var i = 1; i <= data.split("\n").length; i++) {
    (function (index) {
      setTimeout(async function () {
        // 데이터 관측 시간 설정
        var moment_time = moment(moment(Date.now()))
          .toISOString(true)
          .split(".");
        var observed_time = moment_time.join(",");
        let row_data = data.split("\n")[index];
        let row_data_processed = row_data.split(",");
        // 데이터 body
        let body_data = {
          datasetId: "cityDataset6",
          entities: [
            {
              id: "urn:cityDataset6:vredutest1",
              type: "kr.cityhub.CarData:1.1",
              carInformation: {
                type: "Property",
                observedAt: observed_time,
                value: {
                  Cylinders: Number(row_data_processed[1]),
                  Displacement: Number(row_data_processed[2]),
                  Horsepower: Number(row_data_processed[3]),
                  Weight: Number(row_data_processed[4]),
                  Acceleration: Number(row_data_processed[5]),
                  ModelYear: Number(row_data_processed[6]),
                  USA: Number(row_data_processed[7]),
                  Europe: Number(row_data_processed[8]),
                  Japan: Number(row_data_processed[9].replace("\r", "")),
                },
              },
            },
          ],
        };
        try {
          const response = await fetch(
            "http://203.253.128.184:18127/entityOperations/upsert",
            {
              method: "POST",
              body: JSON.stringify(body_data),
              headers: { "Content-Type": "application/json" },
            }
          );
          // console.log(response.json())
          response.json().then((res) => console.log(res));
          // return response.json();
          return response;
        } catch (err) {
          console.log(err);
        }
      }, i * 60000);
    })(i);
  }

  return data;
});

// 위젯 분석용
// READ data
fs.readFile("./차량 예측 원본 데이터 샘플.csv", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  // 데이터 업데이트 by 5 sec
  for (var i = 1; i <= data.split("\n").length; i++) {
    (function (index) {
      setTimeout(async function () {
        // 데이터 관측 시간 설정
        var moment_time = moment(moment(Date.now()))
          .toISOString(true)
          .split(".");
        var observed_time = moment_time.join(",");
        let row_data = data.split("\n")[index];
        let row_data_processed = row_data.split(",");
        // 데이터 body
        let body_data = {
          datasetId: "cityDataset4",
          entities: [
            {
              id: "urn:cityDataset4:vredutest1",
              type: "kr.cityhub.CarData:1.0",
              Cylinders: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[1]),
              },
              Displacemnet: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[2]),
              },
              Horsepower: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[3]),
              },
              Weight: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[4]),
              },
              Acceleration: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[5]),
              },
              ModelYear: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[6]),
              },
              USA: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[7]),
              },
              Europe: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[8]),
              },
              Japan: {
                type: "Property",
                observedAt: observed_time,
                value: Number(row_data_processed[9].replace("\r", "")),
              },
            },
          ],
        };
        try {
          const response = await fetch(
            "http://203.253.128.184:18127/entityOperations/upsert",
            {
              method: "POST",
              body: JSON.stringify(body_data),
              headers: { "Content-Type": "application/json" },
            }
          );
          // console.log(response.json())
          response.json().then((res) => console.log(res));
          // return response.json();
          return response;
        } catch (err) {
          console.log(err);
        }
      }, i * 60000);
    })(i);
  }

  return data;
});

// 데이터 분석용
// READ data
fs.readFile("./공기질 예측 원본 데이터 샘플.csv", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  var rows = data.split("\n");

  let temp_arr = new Array();
  let j = 1;
  while (j < 6001) {
    let row_data = rows[j];
    let processed_row_data = row_data.split(",");
    let humidity = Number(processed_row_data[19]);
    temp_arr.push(humidity);
    if (j == 6000) {
      break;
    }
    j++;
  }

  // 데이터 업데이트 by 5 sec
  for (var i = 1; i <= temp_arr.length; i++) {
    (function (index) {
      setTimeout(async function () {
        // 데이터 관측 시간 설정
        var moment_time = moment(moment(Date.now()))
          .toISOString(true)
          .split(".");
        var observed_time = moment_time.join(",");
        // 데이터 body
        let body_data = {
          datasetId: "cityDataset8",
          entities: [
            {
              id: "urn:cityDataset8:vredutest1",
              type: "kr.cityhub.airQualityData:1.0",
              airQaulity: {
                type: "Property",
                observedAt: observed_time,
                value: Number(temp_arr[index]),
              },
            },
          ],
        };
        try {
          const response = await fetch(
            "http://203.253.128.184:18127/entityOperations/upsert",
            {
              method: "POST",
              body: JSON.stringify(body_data),
              headers: { "Content-Type": "application/json" },
            }
          );
          // console.log(response.json())
          response.json().then((res) => console.log(res));
          // return response.json();
          return response;
        } catch (err) {
          console.log(err);
        }
      }, i * 60000);
    })(i);
  }

  return data;
});
