const errorHandling = {
	al_time_handling: (al_time) => {
		if (al_time === "") {
			throw "분석 시간을 입력 해주세요";
		}
		if (isNaN(+al_time)) {
			throw "분석 시간은 정수여야 합니다.";
		} else {
			return +al_time;
		}
	},
	dataset_handling: (dataset_id) => {
		if (dataset_id === "") {
			throw "데이터 선택을 해주세요";
		}
	},
	input_param_handling: (ip_param) => {
		let user_input_count = 0;
		if (typeof ip_param == "string" || ip_param == undefined) {
			[ip_param].filter((el) => (!el == "" ? user_input_count++ : user_input_count));
			if (user_input_count == 0) {
				throw "맵핑을 위해 최소 한 개의 데이터를 적어주세요";
			}
		} else {
			ip_param.filter((el) => (!el == "" ? user_input_count++ : user_input_count));
			if (user_input_count == 0) {
				throw "맵핑을 위해 최소 한 개의 데이터를 적어주세요";
			}
		}
	},
	al_name_mo_handling: (al_name_mo) => {
		if (al_name_mo === "") {
			throw "데이터 분석 모델 테이블을 선택 해주세요";
		}
	},
	file_upload_handling: (file_obj) => {
		if (file_obj == undefined) {
			throw "분석을 위한 파일을 업로드 해주세요";
		}
	},
};

module.exports = errorHandling;
