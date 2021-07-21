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
			if (user_input_count === 0) {
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
		if (file_obj === undefined) {
			throw "분석을 위한 파일을 업로드 해주세요";
		}
	},
	max_data_load_handling: (max_data_load) => {
		if (max_data_load === '') {
			throw '데이터 분석에 필요한 최소 데이터 갯수를 지정해 주세요'
		}
		if (max_data_load <= 0) {
			throw '데이터 분석에 필요한 데이터 갯수는 1 이상의 숫자여야 합니다'
		}
	},
	data_look_up_handling: (data_lookup_date, data_lookup_hour, data_lookup_min, data_lookup_sec) => {
		if (data_lookup_date && data_lookup_hour && data_lookup_min && data_lookup_sec ) {
			throw '적어도 하나의 데이터 조회 기간 값을 입력해 주세요'
		}
		if(data_lookup_date > 30){
			throw '최대 데이터 조회 기간 설정은 30일 미만 가능합니다'
		}
		if(data_lookup_hour > 23){
			throw '최대 데이터 조회 시간 설정은 24시간 미만 가능합니다'
		}
		if(data_lookup_min > 59){
			throw '최대 데이터 조회 분 설정은 60분 미만 가능합니다'
		}
		if( data_lookup_sec > 59){
			throw '최대 데이터 조회 초 설정은 60초 미만 가능합니다'
		}
	},
	data_processing_option_handling: (selected_sub_data, data_processing) =>{
		console.log(selected_sub_data)
		if(selected_sub_data.length >=2 && data_processing === ''){
			throw '센서 2개 이상 선택 시, 데이터 전처리 옵션을 필수로 선택해 주세요'
		}

	}
};

module.exports = errorHandling;
