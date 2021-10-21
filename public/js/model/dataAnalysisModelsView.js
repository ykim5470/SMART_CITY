const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get("md_id");

const input_params_insert = document.querySelector(".input_params_insert");
const sub_data_insert = document.querySelector(".sub_data_insert");
const data_select_input = document.querySelector("#data_select");
const sub_data_insert_option = document.querySelector(
  ".sub_data_insert_option"
);
const register_complete = document.querySelector("#submitBtn");
const analysis_select_input = document.querySelector("#al_select");

// 모델 id 서버 전달
socket.emit("model_uuid", { md_id: myParam });

// 모델 이름 Fill
socket.on("model_name", (data) => {
  const { md_name } = data;
  const md_name_el = document.querySelector(".md_name");
  md_name_el.value = md_name;
});

// 모델 분석 요청 시간 Fill
socket.on("al_time", (data) => {
  const { al_time } = data;
  const al_time_el = document.querySelector("#al_time");
  al_time_el.value = al_time;
});

// 모델 분석 조회 기간 Fill
socket.on("date_look_up", (data) => {
  const { date_look_up } = data;
  const { date, hour, min, sec } = JSON.parse(date_look_up);
  const look_up_date = document.querySelector("#data_lookup_date");
  const look_up_hour = document.querySelector("#data_lookup_hour");
  const look_up_min = document.querySelector("#data_lookup_min");
  const look_up_sec = document.querySelector("#data_lookup_sec");
  look_up_date.value = date;
  look_up_hour.value = hour;
  look_up_min.value = min;
  look_up_sec.value = sec;
});

// 데이터 모델 선택 Fill
socket.on("data_model_name", (data) => {
  const { data_model_name } = data;
  const data_model_name_el = document.querySelector("#default_data_model");
  data_model_name_el.value = data_model_name;
  let select = document.querySelector("#data_select");
  let value = select.options[select.selectedIndex].text;
  data_model_name_el.text = value;
  for (let i = 0; i < data_select_input.options.length; i++) {
    if (data_select_input[i].value == data_model_name) {
      data_select_input[i].setAttribute("selected", true);
    }
  }

  socket.emit("데이터 선택", {
    dataset_info: data_select_input.value,
  });
});

// 데이터 모델 설명 Fill
socket.on("model_des", (data) => {
  const { model_des } = data;
  document.querySelector(".md_desc").value = model_des;
});

window.addEventListener("load", (e) => {
  if (data_select_input.value != "") {
    socket.emit("데이터 선택", {
      dataset_info: data_select_input.value,
    });
    socket.emit("분석 모델 선택", {
      model_type: analysis_select_input.value.split(",")[0],
      model_namespace: analysis_select_input.value.split(",")[1],
      model_version: analysis_select_input.value.split(",")[2],
      selected_processed_dataset_id: analysis_select_input.value.split(",")[3],
    });
  }
});
// 원천 데이터 선택 값 전송
data_select_input.addEventListener("change", (e) => {
  e.preventDefault();
  if (data_select_input.value == undefined) {
    return;
  }
  socket.emit("데이터 선택", {
    dataset_info: data_select_input.value,
  });
});

socket.on("input_param", (user_param) => {
  socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
    const data_model = attr;


    const input_box = data_model.map((items, index) => {
      return `
          <tr>
              <td><input name="ip_attr_value_type" value="${items.valueType}" readonly /></td>
              <td><input class='ip_attr_name' name="ip_attr_name" value="${items.name}" readonly /></td>
              <td><input type="number" id="user_input_order${index}" name="user_input_order"/></td> 
              <td><input type="text" class="user_input_param${index}" name="user_input_param"/></td>
              <td id='max_data_load_box${index}'></td>
              <td id='param_tf_shape${index}'></td>
          </tr>
          `;
    });
    input_params_insert.innerHTML = input_box.join("");

    let ip_attr = document.getElementsByClassName("ip_attr_name");

    user_param.map((el, idx) => {
      for (let j = 0; j < ip_attr.length; j++) {
        if (ip_attr[j].value == el.ip_param) {
          document.querySelector(`#user_input_order${j}`).value = el.ip_order;
          document.querySelector(`.user_input_param${j}`).value = el.ip_value;
        }
      }
    });

    // 데이터 선택 후 유저 입력 여부 확인 및 테이블 데이터 INSERT
    const user_input_param = document.getElementsByName("user_input_param");
    const input_arr = Array.from(user_input_param);

    input_arr.map((el, index) => {
      if (el.value != "") {
        let max_data_load_box = document.querySelector(
          `#max_data_load_box${index}`
        );
        let param_tf_shape_box = document.querySelector(
          `#param_tf_shape${index}`
        );
        if (el.value !== "") {
          max_data_load_box.innerHTML = `
          <input name='max_data_load_index' value=${index} hidden/>
          <input class='max_data_load_limit${index}' type='number' name='max_data_load' placeholder="i.e. 5 10 48 etc"/>
          `;
          param_tf_shape_box.innerHTML = `
          <input name='tf_shape_index' value=${index} hidden/>
          <input name='tf_shape' class='tf_shape${index}' placeholder='i.e. [40] [[1,2,3],[4,5,6]]'/>`;
        } else {
          max_data_load_box.innerHTML = "";
          param_tf_shape_box.innerHTML = "";
        }
      }
      el.addEventListener("change", (e) => {
        let max_data_load_box = document.querySelector(
          `#max_data_load_box${index}`
        );
        let param_tf_shape_box = document.querySelector(
          `#param_tf_shape${index}`
        );
        if (e.target.value !== "") {
          max_data_load_box.innerHTML = `
          <input name='max_data_load_index' value=${index} hidden/>
          <input class='max_data_load_limit${index}' type='number' name='max_data_load' placeholder="i.e. 5 10 48 etc"/>
          `;
          param_tf_shape_box.innerHTML = `
          <input name='tf_shape_index' value=${index} hidden/>
          <input name='tf_shape' class='tf_shape${index}' placeholder='i.e. [40] [[1,2,3],[4,5,6]]'/>`;
        } else {
          max_data_load_box.innerHTML = "";
          param_tf_shape_box.innerHTML = "";
        }
      });
    });

    user_param.map((el, idx) => {
      for (let j = 0; j < ip_attr.length; j++) {
        if (ip_attr[j].value == el.ip_param) {
          document.querySelector(`.max_data_load_limit${j}`).value = el.ip_load;
          document.querySelector(`.tf_shape${j}`).value = JSON.parse(
            el.ip_param_type
          );
        }
      }
    });
  });
});

// sub_data GET & add to page

// 서브 데이터 모델 선택 Fill
socket.on("sub_data", (selected_data) => {
  const { sub_data } = selected_data;

  socket.on("데이터 선택 완료 및 개별 센서 데이터 calling", (data) => {

    if (typeof sub_data == "string") {
      let selected_id = sub_data.split("/")[0];
      const sub_data_arr = data;
      const sub_box = sub_data_arr.map((items, index) => {
        if (items.id == selected_id) {
          return `
          <tr>
              <td>
                  <input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id} checked/>
              </td>
              <td>${items.name.value}</td>
          <tr>
          `;
        } else {
          return `
        <tr>
            <td>
                <input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id}/>
            </td>
            <td>${items.name.value}</td>
        <tr>
        `;
        }
      });
      sub_data_insert.innerHTML = sub_box.join("");
    } else {
      const sub_data_arr = data;
      let sub_data_modified = sub_data.map((el) => el.split("/")[0]);
      const sub_box = sub_data_arr.map((items, index) => {
        if (sub_data_modified.includes(items.id)) {
          return `
              <tr>
                  <td>
                      <input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id} checked/>
                  </td>
                  <td>${items.name.value}</td>
              <tr>
              `;
        } else {
          return `
              <tr>
                  <td>
                      <input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id}/>
                  </td>
                  <td>${items.name.value}</td>
              <tr>
              `;
        }
      });
      sub_data_insert.innerHTML = sub_box.join("");
    }

    let temp_sub_data_list = new Array();
    temp_sub_data_list.push(sub_data);
    sub_data_insert.addEventListener("click", (e) => {
      if (temp_sub_data_list.includes(e.target.value)) {
        temp_sub_data_list = temp_sub_data_list.filter((el) => {
          return el !== e.target.value;
        });
      } else {
        temp_sub_data_list.push(e.target.value);
      }
      let sub_data_list = temp_sub_data_list.filter((item) => {
        return item !== undefined;
      });

      if (sub_data_list.length >= 2) {
        let sub_option_box = `
              <td>
                  <label for="data_processing">옵션 선택: </label>
                  <select name="data_processing">
                      <option value="">선택</option>
                      <option value="add">합</option>
                      <option value="average">평균</option>
                  </select>
              </td>
              `;
        sub_data_insert_option.innerHTML = sub_option_box;
      } else {
        let sub_option_box_delete = `<tr></tr>`;
        sub_data_insert_option.innerHTML = sub_option_box_delete;
      }
    });
  });
});

const register_submit = () => {
  register_complete.addEventListener("click", async (e) => {
    // 파일 정보 post
    return await document.querySelector("#modify_complete").submit();
  });
};

register_submit();
