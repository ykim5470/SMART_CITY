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
const register_edit = document.querySelector("#submitBtn");
const model_description = document.querySelector(".md_desc");

const user_input_value = [];

// 데이터 선택 값 전송
if (data_select_input.value !== "") {
    socket.emit("데이터 선택", {
		dataset_info: data_select_input.value,
    });
    data_select_input.addEventListener("change", (e) => {
        e.preventDefault();
        if (data_select_input.value == undefined) {
            return;
        }
    
        socket.emit("데이터 선택", {
            dataset_info: data_select_input.value,
        });
    });
}


// 분석 데이터 선택
if (analysis_select_input.value !== "") {
    socket.emit("분석 모델 선택", {
		al_name_mo: analysis_select_input.value,
    });


    analysis_select_input.addEventListener("change", (e) => {
        e.preventDefault();
        if (analysis_select_input.value == undefined) {
            return;
        }
    
        socket.emit("분석 모델 선택", {
            al_name_mo: analysis_select_input.value,
        });
    });
}


/* Event listen */
// input params GET & add to page
socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
	const data_model = attr;
	const input_box = data_model.map((items, index) => {
		return `
        <tr>
            <td><input name="ip_attr_value_type" value="${items.valueType}" readonly /></td>
            <td><input class='ip_attr_name' name="ip_attr_name" value="${items.name}" readonly /></td>
            <td><input class="user_input_param" name="user_input_param"/></td>
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
			socket.emit("입력 데이터 값", { user_input_value: user_input_value });
		});
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

	const user_output_param = document.getElementsByClassName("user_output_param");
	// 해당 output_value를 어떻게 할 것인가?
});


const register_submit = () => {
	register_edit.addEventListener("click", async (e) => {
			alert("수정 준비 완료");
			// 파일 정보 post
			return document.querySelector("#register_edit").submit()
	});
};

register_submit()