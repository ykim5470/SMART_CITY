// client socket instance create
const socket = io();
/* 
    DOM
    - 분석 시간 
 */
const al_time_input = document.querySelector("#al_time");
const data_select_input = document.querySelector("#data_select");
const analysis_select_input = document.querySelector("#al_select");
const file_select_input = document.querySelector("#file_select");
const input_params_insert = document.querySelector(".input_params_insert");
const output_params_insert = document.querySelector(".output_params_insert");
const register_complete = document.querySelector("#submitBtn");

/* emit event */
// 분석 시간 입력 값 전송
al_time_input.addEventListener("keyup", () => {
	socket.emit("분석 시간 입력", {
		isTyping: al_time_input.value.length > 0,
		al_time: al_time_input.value,
	});
});

// 데이터 선택 값 전송
data_select_input.addEventListener("change", (e) => {
	e.preventDefault();
	if (data_select_input.value == undefined) {
		return;
	}
	console.log(data_select_input.value);

	socket.emit("데이터 선택", {
		dataset_info: data_select_input.value,
	});
});

// 분석 데이터 선택
analysis_select_input.addEventListener("change", (e) => {
	e.preventDefault();
	if (analysis_select_input.value == undefined) {
		return;
	}

	socket.emit("분석 모델 선택", {
		al_name_mo: analysis_select_input.value,
	});
});

// 파일 선택
file_select_input.addEventListener("change", (e) => {
	e.preventDefault();
	if (file_select_input.value == undefined) {
		return;
	}
	console.log(file_select_input.value);

	socket.emit("파일 메타 정보", {
		file_meta_info: file_select_input.value,
	});
});

console.log("처음 숨겨진 친구" + input_params_insert.childNodes);
console.log(input_params_insert.childNodes);

/* Event listen */
// input params GET & add to page
socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
	const data_model = attr; // JSON res
	console.log(data_model);
	console.log("API 반환 데이터 : " + data_model);

	const input_box = data_model.map((items, index) => {
		return `
        <tr>
            <td><input name="ip_attr_value_type" value="${items.valueType}" disabled /></td>
            <td><input name="ip_attr_name" value="${items.name}" disabled /></td>
            <td><input class="user_input_param" name="user_input_param${index}"/></td>
        </tr>
        `;
	});
	input_params_insert.innerHTML = input_box.join("");

	const user_input_param = document.getElementsByClassName("user_input_param");
	const input_arr = Array.from(user_input_param);

	const user_input_value = [];

	input_arr.map((el) => {
		el.addEventListener("change", (e) => {
			console.log(e.target.value);
            return user_input_value.push({ key: e.target.name, value: e.target.value });
		});
    });
    console.log(user_input_value.length)
    
    let isTrue = (user_input_value.length === 0) ? false :true
    console.log(isTrue)
    test1(isTrue)

});

// output params GET & add to page
socket.on("분석 모델 선택 완료 및 아웃풋 calling", (data) => {
	const model_column = data;
	console.log("DB 반환 데이터 : " + data);

	const output_box = model_column.map((items) => {
		return `
        <tr>
        <td><input name="op_attr_value_type" value="${items.attributeType}" disabled /></td>
        <td><input name="op_attr_name" value="${items.column_name}" disabled /></td>
        <td><input name="user_output_param" placeholder="TF로 자동 채워질 예정"" /></td>
        </tr>
        `;
	});
	output_params_insert.innerHTML = output_box.join("");
});

// 등록 완료
const test1 = (isTrue) => {
    register_complete.addEventListener("click", (e) => {
        e.preventDefault();
        console.log(analysis_select_input.value) // ""
        console.log(isTrue) // undefined
        console.log(file_select_input.value) // ""
        // 분석 시간 숫자인지 아닌지, 데이터 선택이 되었는지 아닌지, 인풋이 1개 이상 있는 지 없는지, 분석 테이블이 선택 되었는지 아닌지, 파일이 선택 되었는지 아닌지 
        if ((!isNaN(al_time_input.value) && al_time_input.value !=='') || analysis_select_input.value === "" || isTrue || file_select_input.value === "") {
			alert ('필수 값 입력 필요');
        }
        else{alert( '등록 준비 완료')}
	});
};
