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

// 아웃풋 데이터 예측 좋회 기간 startTime 계산 모듈
const predict_time_generator = (date_look_up, current_time) => {
  const { date, hour, min, sec } = date_look_up; // '2' '3' '' ''
  let res =
    date != ""
      ? moment(current_time).add(Number(date), "d").format()
      : current_time;
  res = hour != "" ? moment(res).add(Number(hour), "h").format() : res;
  res = min != "" ? moment(res).add(Number(min), "m").format() : res;
  res = sec != "" ? moment(res).add(Number(sec), "s").format() : res;

  var moment_time = moment(res).toISOString(true).split('.')
  var observed_time = moment_time.join(',')
  console.log(observed_time)
  return observed_time;
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
    var variable_attr_ip_value = Object.values(sorted_input_param)[j]
    running_result[variable_attr_ip_value] = variable_attr_data;
  }
  return running_result;
};

// 다중 데이터 센서 선택 시 맵핑 데이터 생성 모듈

// 다중 데이터 센서 선택 시 맵핑 옵션 모듈
const options = (option_name, pre_processed_data) => {
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
  let promise_resolver = Promise.all(pre_processed_data).then((values) => {
    return list_add(values);
  });

  return promise_resolver;
};

// 다중 데이터 센서 Average 옵션
const average_processing = (pre_processed_data) => {
  let promise_resolver = Promise.all(pre_processed_data).then((values) => {
    let add_processed = list_add(values);
    let attr = Object.keys(values[0]);
    let divider = pre_processed_data.length

    let average_processed = new Object();
    // 평균 로직
    for (let e = 0; e < attr.length; e++) {
      let single_attr = attr[e];
      let single_value = add_processed[single_attr];
      if (Array.isArray(single_value)) {
        let isNum = single_value.every((x) => typeof x === "number");
        let aver = isNum
          ? single_value.map((total) => total / divider)
          : single_value;
        average_processed[single_attr] = aver;
      }
    }
    return average_processed;
  });

  return promise_resolver;
};

// 다중 데이터 센서 Add 모듈
const list_add = (list_values) => {
  let attr_chunks_array = new Array();
  const add_processed = new Object();
  let attr = Object.keys(list_values[0]);
  // Extract every values from list_values
  let extracted_list = new Array();
  for (let e = 0; e < list_values.length; e++) {
    for (let m = 0; m < attr.length; m++) {
      extracted_list.push(list_values[e][attr[m]]);
    }
  }

  let chunks_line = extracted_list.length / attr.length;

  // 같은 attr끼리 묶기
  for (let p = 0; p < attr.length; p++) {
    for (let l = 0; l < chunks_line; l++) {
      attr_chunks_array.push(extracted_list[p + attr.length * l]);
    }
  }

  var chunks = [];

  // 같은 attr을 한 개의 array안에 넣기
  attr_chunks_array.forEach((item) => {
    if (!chunks.length || chunks[chunks.length - 1].length == chunks_line)
      chunks.push([]);

    chunks[chunks.length - 1].push(item);
  });

  // 합 적용
  for (let q = 0; q < attr.length; q++) {
    let add_result = chunks[q].reduce(function (array1, array2) {
      isNum = array1.every(x => typeof x === 'number')
      if(isNum){
      return array1.map(function (value, index) {
        return value + array2[index];
      });
    }else{
      let pre_array = array1.map(function (value, index){
        return (value.concat(' ', array2[index]))
      })
      return pre_array[0].split(' ')
    }
    });
    add_processed[attr[q]] = add_result;
  }
  return add_processed;
};

// 유저 인풋 attr & value sorting
const sorted_input_param = (user_input_value) => {
  var sorted_input_param = new Object
  user_input_value.map(el => sorted_input_param[el.ip_param] = el.ip_value)

  return sorted_input_param;
};


// 인풋 데이터 원천 데이터 맵핑
const data_mapped_filling = (select_input_count, raw_data, sortable, load) => {
  const variable = Object.keys(sortable)[select_input_count];
  const variable_with_data = new Array();
  const raw_data_attr_list = Object.keys(raw_data);
  if (raw_data_attr_list.includes(variable)) {
    const raw_len = raw_data[variable].length;
    // 원천 데이터 셋에 유저가 필요한 갯수의 attr value가 부족할 때
    if (raw_len < load) {
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
      raw_data[variable].map((el) => {
        variable_with_data.push(el.value);
      });
    }
    // 원천 데이터 셋에 유저가 필요한 갯수의 attr value가 넘을 때
    else if (raw_len > load) {
      raw_data[variable].map((el) => {
        variable_with_data.push(el.value);
      });
      variable_with_data.splice(load, raw_len - 1); // 50개를 2개 없애서 48개만 가져온다.
    }
  }
  // 원천 데이터 셋에 해당 attr자체가 없을 경우
  else {
    for (let k = 0; k < load; k++) {
      variable_with_data.push(0);
    }
  }
  return variable_with_data;
};

module.exports = {
  my_scheduleJob,
  start_end_time_generator,
  predict_time_generator,
  sorted_input_param,
  single_processed_data,
  options,
};
