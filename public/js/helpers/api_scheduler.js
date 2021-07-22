const schedule = require("node-schedule");
const parser = require("cron-parser");
const moment = require("moment");

// 반복 스케쥴러 JOB 생성 모듈
const my_scheduleJob = (
  id,
  mxTimezones,
  cron_expression,
  function_name,
  cancel
) => {
  var options = {
    tz: mxTimezones,
  };

  var cron_attr = cron_expression.split(" ");
  var interval = parser.parseExpression(cron_expression, options);
  var cronDate = interval.next();
  var rule = new schedule.RecurrenceRule();

  for (var i in cron_attr) {
    var res = "";
    switch (i) {
      case "0":
        res = getRuleValue(cron_attr[i], 0, 59);
        rule.second = res == "1" ? cronDate.getSeconds() : res;
      case "1":
        res = getRuleValue(cron_attr[i], 0, 59);
        rule.minute = res == "1" ? cronDate.getMinutes() : res;
        break;
      case "2":
        res = getRuleValue(cron_attr[i], 0, 23);
        rule.hour = res == "1" ? cronDate.getHours() : res;
        break;
      case "3":
        res = getRuleValue(cron_attr[i], 1, 31);
        rule.date = res == "1" ? cronDate.getDate() : res;
        break;
      case "4":
        res = getRuleValue(cron_attr[i], 1, 12);
        rule.month = res == "1" ? cronDate.getMonth() : res;
        break;
      case "5":
        res = getRuleValue(cron_attr[i], 0, 6);
        rule.dayOfWeek = res == "1" ? cronDate.getDay() : res;
        break;
    }
  }

  rule.tz = mxTimezones;

  let jobId = String(id);
  if (cancel) {
    schedule.scheduleJob(jobId, rule, () => {
      console.log("스케쥴러 실행");
      console.log(jobId + "실행");
      function_name();
    });
  } else {
    let jobs = schedule.scheduledJobs;
    var running_jobs = jobs[jobId];
    if (Object.keys(jobs).length === 0 && jobs.constructor === Object) {
      console.log("실행중이던 job 존재하지 않음");
      return;
    } else {
      running_jobs.cancel();
      console.log("실행중이던 job 중지");
    }
  }
};

// 클론 시간 표현 값 변환 모듈
function getRuleValue(value, start_value, end_value) {
  if (/^[*\d][\/][\d]+$/.test(value)) {
    return new schedule.Range(
      start_value,
      end_value,
      parseInt(value.split("/")[1])
    );
  } else if (value == "MON-FRI") {
    return new schedule.Range(1, 5);
  } else if (value == "*") {
    return null;
  } else {
    return "1";
  }
}

// 데이터 조회 기간 startTime 계산 모듈
const start_end_time_generator = (date_look_up, current_time) => {
  const { date, hour, min, sec } = date_look_up; // '2' '3' '' ''
  let res =
    date != ""
      ? moment(current_time).subtract(Number(date), "d").format()
      : current_time;
  res = hour != "" ? moment(res).subtract(Number(hour), "h").format() : res;
  res = min != "" ? moment(res).subtract(Number(min), "m").format() : res;
  res = sec != "" ? moment(res).subtract(Number(sec), "s").format() : res;
  return res;
};

// 싱글 데이터 센서 선택 시 맵핑 데이터 생성 모듈
const single_processed_data = (
  user_input_value_count,
  sorted_input_param,
  raw_data_bundle,
  user_input_value
) => {
  const running_result = new Object();
  for (let j = 0; j < user_input_value_count; j++) {
    var variable_attr = Object.keys(sorted_input_param)[j];
    var variable_load;
    user_input_value.map((el, idx) => {
      if (el.ip_param === variable_attr) return (variable_load = el.ip_load);
    });
    var variable_attr_data = data_mapped_filling(
      j,
      raw_data_bundle,
      sorted_input_param,
      variable_load
    );
    running_result[variable_attr] = variable_attr_data;
  }
  return running_result;
};

// 다중 데이터 센서 선택 시 맵핑 데이터 생성 모듈

// 다중 데이터 센서 선택 시 맵핑 옵션 모듈
const options = (option_name, pre_processed_data) => {
  console.log("---------------------------");
  console.log(pre_processed_data);
  console.log("---------------------------");
  let res = "";
  switch (option_name) {
    case "add":
      res = add_processing(pre_processed_data);
      break;
    case "average":
      res = average_processing(pre_processed_data);
      break;
  }
  return res;
};

// 다중 데이터 센서 Add 옵션
const add_processing = (pre_processed_data) => {
  if (Object.keys(pre_processed_data).length === 0) {
    console.log("처음에 이거 실행");
    return [];
  } else {
    console.log(pre_processed_data + "빈 값 아님");
    let total_variable = new Object();
    let attr = Object.keys(pre_processed_data[0]);
    let length = pre_processed_data.length;
    for (let k = 0; k < length; k++) {
      var sum = pre_processed_data[k][attr[k]].map((el, idx) => {
        return el + pre_processed_data[length - 1][attr[k]][idx];
      });
      total_variable[attr[k]] = sum;
    }
    return total_variable;
  }
};

// 다중 데이터 센서 Average 옵션
const average_processing = (pre_processed_data) => {
  console.log("평균");
};

// 유저 인풋 attr & value sorting
const sorted_input_param = (user_input_value) => {
  sortable_input_param = new Array();
  user_input_value.map(
    (el) => (sortable_input_param[el.ip_param] = Number(el.ip_value))
  );
  var sorted_input_param = Object.fromEntries(
    Object.entries(sortable_input_param).sort(([, a], [, b]) => a - b)
  );
  return sorted_input_param;
};

// 인풋 데이터 원천 데이터 맵핑
const data_mapped_filling = (select_input_count, raw_data, sortable, load) => {
  const variable = Object.keys(sortable)[select_input_count];
  const variable_with_data = new Array();
  const raw_data_attr_list = Object.keys(raw_data);

  if (raw_data_attr_list.includes(variable)) {
    const raw_len = raw_data[variable].length;
    console.log(load)
    // 원천 데이터 셋에 유저가 필요한 갯수의 attr value가 부족할 때
    if (raw_len < load) {
      console.log("-------------------------------1");
      // 부족한 갯수를 채울 평균 값
      let current_value_sum = 0;
      raw_data[variable].map((el) => {
        current_value_sum += el.value;
      });
      // 평균 값
      var average_of_data = current_value_sum / raw_len;
      // 채워야 하는 갯수
      var filling_num = load - raw_len;
      // 평균 값을 더해서 채움
      raw_data[variable].map((el) => {
        variable_with_data.push(el.value);
      });
      // 선택한 attr value가 string이 아닐 경우 나머지를 평균 값으로 채울 수 있다
      if (!isNaN(average_of_data)) {
        for (let k = 0; k < filling_num; k++) {
          variable_with_data.push(average_of_data);
        }
      }
      // 선택한 attr value가 string일 경우 그 첫 번째 값으로 나머지를 채운다 
      else {
        for (let k = 0; k < filling_num; k++) {
          variable_with_data.push(variable_with_data[0]);
        }
      }
    }
    // 원천 데이터 셋에 유저가 필요한 갯수의 attr value가 있다면 진행
    else if (raw_len === load) {
      console.log("---------------------------4");
      raw_data[variable].map((el) => {
        variable_with_data.push(el.value);
      });
    }
    // 원천 데이터 셋에 유저가 필요한 갯수의 attr value가 넘을 때
    else if (raw_len > load) {
      console.log("-----------------------------------3");
      raw_data[variable].map((el) => {
        variable_with_data.push(el.value);
      });
      variable_with_data.splice(load, raw_len -1); // 50개를 2개 없애서 48개만 가져온다.
    }
  }
  // 원천 데이터 셋에 해당 attr자체가 없을 경우
  else {
    console.log("---------------------------------2");
    for (let k = 0; k < load; k++) {
      variable_with_data.push(0);
    }
  }

  console.log(variable_with_data);
  return variable_with_data;
};

module.exports = {
  my_scheduleJob,
  start_end_time_generator,
  sorted_input_param,
  single_processed_data,
  options,
};
