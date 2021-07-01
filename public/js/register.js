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

const user_input_value = [];
let isTrue = false;
let isInput = [];

/* emit event */
// 분석 시간 입력 값 전송
al_time_input.addEventListener("keyup", () => {
	var al_time = al_time_input.value;
	socket.emit("분석 시간 입력", {
		isTyping: al_time_input.value.length > 0,
		al_time: +al_time,
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

// 모델 설명
model_description.addEventListener("change", (e) => {
	socket.emit("분석 모델 설명", e.target.value
	);
});

/* Event listen */
// input params GET & add to page
socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
	const data_model = attr;
	console.log(data_model);
	console.log("API 반환 데이터 : " + data_model);

	const input_box = data_model.map((items, index) => {
		return `
        <tr>
            <td><input name="ip_attr_value_type" value="${items.valueType}" disabled /></td>
            <td><input class='ip_attr_name' name="ip_attr_name" value="${items.name}" disabled /></td>
            <td><input class="user_input_param" name="user_input_param${index}"/></td>
        </tr>
        `;
	});
	input_params_insert.innerHTML = input_box.join("");

	// 데이터 선택 후 유저 입력 여부 확인 및 테이블 데이터 INSERT
	const user_input_param = document.getElementsByClassName("user_input_param");
	const ip_attr_name = document.getElementsByClassName("ip_attr_name");
	const input_arr = Array.from(user_input_param);
	const input_name_arr = Array.from(ip_attr_name);

	input_arr.map((el, index) => {
		el.addEventListener("change", (e) => {
			let input_mapping = input_name_arr.filter((el, idx) => {
				if (idx === index) {
					user_input_value.push({ key: el.value, value: e.target.value });
				} else {
					return;
				}
			});
			console.log(e.target.value);
			socket.emit("입력 데이터 값", { user_input_value: user_input_value });
		});
	});
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

	const user_output_param = document.getElementsByClassName("user_output_param");
	// 해당 output_value를 어떻게 할 것인가?
});

socket.on("입력 데이터 값 반환", (data) => {
	isInput = [...data];
	console.log(isInput);
	if (isInput === []) {
		isTrue = false;
	} else {
		isTrue = true;
		console.log("유저 입력 함");
	}
	register_submit(isTrue);
});

const register_submit = (isTrue) => {
	register_complete.addEventListener("click", async (e) => {
		e.preventDefault();
		console.log(!isNaN(al_time_input.value) && al_time_input.value !== "");
		console.log(isTrue);
		console.log(analysis_select_input.value != ""); // ""
		console.log(file_select_input.value !== ""); // ""
		// 분석 시간 숫자인지 아닌지, 데이터 선택이 되었는지 아닌지, 인풋이 1개 이상 있는 지 없는지, 분석 테이블이 선택 되었는지 아닌지, 파일이 선택 되었는지 아닌지
		if (!isNaN(al_time_input.value) && al_time_input.value !== "" && analysis_select_input.value !== "" && isTrue && file_select_input.value !== "") {
			alert("등록 준비 완료");
			// 파일 정보 post
			document.querySelector(".encripted_file").submit()
			// 서버에 필요 데이터 전송 및 처리
			await socket.emit("데이터 전송 요청")
		} else {
			alert("필수 값 입력 필요");
			return;
		}
	});
};

