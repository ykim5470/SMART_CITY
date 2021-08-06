// Client socket instance create
const socket = io();

/* 
    DOM
  - 분석 시간 input
	- 데이터 선택 input
	- 분석 모델 선택 input
	- 인풋 파라미터 유저 input
	- 파일 선택 input
	- 아웃풋 파라미터 
	- 등록 완료
 */
const al_time_input = document.querySelector("#al_time");
const data_select_input = document.querySelector("#data_select");
const analysis_select_input = document.querySelector("#al_select");
const file_select_input = document.querySelector("#file_select");
const input_params_insert = document.querySelector(".input_params_insert");
const output_params_insert = document.querySelector(".output_params_insert");
const register_complete = document.querySelector("#submitBtn");
const model_description = document.querySelector(".md_desc");
const sub_data_insert = document.querySelector(".sub_data_insert");
const sub_data_insert_option = document.querySelector(
  ".sub_data_insert_option"
);

const user_input_value = new Array();

window.addEventListener("load", (e) => {
  if (data_select_input.value != "") {
    socket.emit("데이터 선택", {
      dataset_info: data_select_input.value,
    });
    socket.emit("분석 모델 선택", {
      al_name_mo: analysis_select_input.value.split(",")[0],
      selected_processed_dataset_id: analysis_select_input.value.split(",")[1],
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

// 가공 데이터 셋 선택
analysis_select_input.addEventListener("change", (e) => {
  e.preventDefault();
  if (analysis_select_input.value == undefined) {
    return;
  }
  socket.emit("분석 모델 선택", {
    al_name_mo: analysis_select_input.value.split(",")[0],
    selected_processed_dataset_id: analysis_select_input.value.split(",")[1],
  });
});

/* Event listen */
// input params GET & add to page
socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
  const data_model = attr;
  const input_box = data_model.map((items, index) => {
    return `
        <tr>
            <td><input name="ip_attr_value_type" value="${items.valueType}" readonly /></td>
            <td><input class='ip_attr_name' name="ip_attr_name" value="${items.name}" readonly /></td>
            <td><input type="text" class="user_input_param" name="user_input_param"/></td>
            <td id='max_data_load_box${index}'></td>
            <td id='param_tf_shape${index}'></td>
        </tr>
        `;
  });
  input_params_insert.innerHTML = input_box.join("");

  // 데이터 선택 후 유저 입력 여부 확인 및 테이블 데이터 INSERT
  const user_input_param = document.getElementsByClassName("user_input_param");
  const input_arr = Array.from(user_input_param);

  input_arr.map((el, index) => {
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
        <input class='max_data_load_limit' type='number' name='max_data_load' placeholder="i.e. 5 10 48 etc"/>
        `;
        param_tf_shape_box.innerHTML = `
        <input name='tf_shape_index' value=${index} hidden/>
        <input name='tf_shape' class='tf_shape' placeholder='i.e. [40] [[1,2,3],[4,5,6]]'/>`;
      } else {
        max_data_load_box.innerHTML = "";
        param_tf_shape_box.innerHTML = "";
      }
    });
  });
});

// sub_data GET & add to page
socket.on("데이터 선택 완료 및 개별 센서 데이터 calling", (data) => {
  const sub_data = data;
  const sub_box = sub_data.map((items, index) => {
    return `
		<tr>
			<td>
				<input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id}/>
			</td>
			<td>${items.name.value}</td>
		<tr>
		`;
  });
  sub_data_insert.innerHTML = sub_box.join("");
  let temp_sub_data_list = new Array();
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
    console.log(sub_data_list);
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

// output params GET & add to page
socket.on("분석 모델 선택 완료 및 아웃풋 calling", (data) => {
  const model_column = data;
  // console.log("DB 반환 데이터 : " + data);

  const output_box = model_column.map((items) => {
    return `
        <tr>
        <td><input name="op_attr_value_type" value="${items.attributeType}" readonly /></td>
        <td><input name="op_attr_name" value="${items.column_name}" readonly /></td>
        <td><input name="user_output_param" placeholder="TF로 자동 채워질 예정"" /></td>
        </tr>
        `;
  });
  output_params_insert.innerHTML = output_box.join("");

  const user_output_param =
    document.getElementsByClassName("user_output_param");
  // 해당 output_value를 어떻게 할 것인가?
});

const register_submit = () => {
  register_complete.addEventListener("click", async (e) => {
    // 파일 정보 post
    return await document.querySelector("#register_complete").submit();
  });
};

register_submit();
