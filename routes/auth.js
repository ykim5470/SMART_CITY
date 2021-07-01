const { model_list, model_output, model_des, model_input, atch_file_tb, analysis_list, dataset, column_tb, sequelize } = require("../models");
const axios = require("axios");
const analysis = require("./analysis.js");
const moment = require("moment");

// Get
const output = {
	// 모델 관리 보드
	manage_board: async (req, res) => {
		try {
			const currentPage = req.query.page; // 현재 페이지
			const temp = req.url; //현재 경로
			let offset = 0;
			if (currentPage > 1) {
				offset = 10 * (currentPage - 1);
			}
			console.log(req.query.page);
			console.log(req.query.limit);
			await model_list
				.findAndCountAll({
					limit: req.query.limit,
					offset: offset,
					attributes: {
						exclude: ["updatedAt"],
					},
				})
				.then((result) => {
					const itemCount = result.count; //총 게시글 갯수
					const pageCount = Math.ceil(itemCount / req.query.limit); //페이지 갯수
					const base = "model_manage_board"; // base url
					const pageArray = analysis.paging.makeArray(base, currentPage, pageCount, temp);
					const hasMore = currentPage < pageCount ? `${base}?page=${currentPage + 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
					const hasprev = currentPage > 1 ? `${base}?page=${currentPage - 1}&limit=10` : `${base}?page=${currentPage}&limit=10`;
					model_list.prototype.dateFormat = (date) => moment(date).format("YYYY.MMM.DD - hh:mm A");
					return res.render(`model/model_manage_board`, { list_data: result.rows, pages: pageArray, nextUrl: hasMore, prevUrl: hasprev });
				});
		} catch (err) {
			return res.status(500).json({
				error: "SQL query error",
			});
		}
	},

	// 데이터 선택
	dataset_select: async (req, res) => {
		const dataset = await axios.get("http://203.253.128.184:18827/datasets", { headers: { Accept: "application/json" } });
		const dataset_dict = [];
		dataset.data.filter((el) => {
			return dataset_dict.push({ key: el.name, value: { id: el.id, dataModelType: el.dataModelType, dataModelNamespace: el.dataModelNamespace, dataModelVersion: el.dataModelVersion } });
		});
		return dataset_dict;
	},

	manage_status: (req, res) => {
		const { status } = req.query;
		const { md_id } = req.params;
		return res.render("model/model_status", { current_status: status, md_id: md_id });
	},

	register_edit: (req, res) => {
		const md_id = req.params.md_id;
		let al_time_prev;
		let md_name_prev;
		let al_name_mo_prev;
		model_list
			.findAll({
				attributes: {
					exclude: ["updatedAt", "createdAt"],
				},
				where: { md_id: md_id },
				include: [
					{ model: model_des, required: false, attributes: ["des_text"] },
					{ model: atch_file_tb, required: false, attributes: ["originalname"] },
					{ model: analysis_list, required: false, attributes: ["al_context"] },
				],
				raw: true,
			})
			.then((result) => {
				const model_edit_str = JSON.stringify(result);
				const model_edit_value = JSON.parse(model_edit_str)[0];
				console.log(model_edit_value); // md_id, al_time, md_name, al_name_mo, run_status, data_model_name, al_id, des_text, originalname, al_context
				al_time_prev = model_edit_value.al_time;
				md_name_prev = model_edit_value.md_name;
				al_name_mo_prev = model_edit_value.al_name_mo;

				model_input.findAll({ where: { ip_id: md_id }, attirbutes: ["ip_param", "ip_value"] }).then((results) => {
					const model_input_info_str = JSON.stringify(results);
					const model_input_info_value = JSON.parse(model_input_info_str);
					console.log(model_input_info_value);
					console.log(al_time_prev);
					const dataset_name = output.dataset_select();
					dataset_name.then((outcome) => {
						return res.render(`model/model_register_board_edit`, { md_id: md_id, al_time: al_time_prev, md_name: md_name_prev, al_name_mo: al_name_mo_prev, dataset_name: outcome });
					});
				});
			});
	},

	// 모델 등록 보드
	model_register_board: async (req, res) => {
		try {
			await analysis_list
				.findAll({
					attributes: ["al_name"],
				})
				.then((result) => {
					const str = JSON.stringify(result);
					const newValue = JSON.parse(str);
					const dataset_name = output.dataset_select();
					dataset_name.then((result) => {
						res.render(`model/model_register_board`, { al_name_mo: newValue, dataset_name: result, input_items: [] });
					});
				});
		} catch (err) {
			return res.status(500).json({
				error: "Something went wrong",
			});
		}
	},
};

// Post
const process = {
	// 파일 업로드
	file_add: async (req, res) => {
		try {
			console.log("파일 업로드");
			const { originalname, mimetype, path, filename } = req.file;
			atch_file_tb.create({
				file_id,
				originalname,
				mimetype,
				path,
				filename,
			});
			console.log("파일 처리 완료");
			return;
			// model_list.findOne({ order: [["createdAt", "DESC"]] }).then((res) => {
			// 	console.log("최근 등록한 모델 찾기");
			// 	const file_str = JSON.stringify(res);
			// 	const file_value = JSON.parse(file_str);
			// 	console.log("찾았나?");
			// 	console.log(file_value);
			// 	console.log("--------------------");
			// 	let file_id = file_value.md_id;
			// 	const { originalname, mimetype, path, filename } = req.file;
			// 	atch_file_tb.create({
			// 		file_id: file_id,
			// 		originalname,
			// 		mimetype,
			// 		path,
			// 		filename,
			// 	});
			// .then((res) => {
			// 	const model_from_file = JSON.stringify(res);
			// 	const model_from_file_value = JSON.parse(model_from_file);
			// 	let md_name = model_from_file_value.originalname.split(".")[0];
			// 	console.log('해당 모델 업데이트')
			// 	console.log(md_name)
			// 	console.log(file_id)
			// 	let encrypted_name = model_from_file_value.filename;
			// 	model_list.update({ md_name: md_name, encrypted_file: encrypted_name }, { where: { md_id: file_id } });
			// });
			// return res.redirect("/model_manage_board");
		} catch (err) {
			return res.status(500).json({
				error: "file upload failed",
			});
		}
	},

	// 등록 완료
	register_complete: async (req, res) => {
		if (req.file !== undefined) {
			console.log("일단 파일 업로드 부터 실행");
			process.file_add(req);
			return;
		} else {
			console.log("다음으로 요청이 오긴 하나?");
			console.log(req.body);
			const { al_time_obj, input_param_obj, data_selection_obj, al_name_mo_obj, md_desc } = req.body;
			let al_time = al_time_obj.al_time;
			let al_name_mo = al_name_mo_obj.al_name_mo;
			let data_model_name = data_selection_obj.dataset_info;
			let al_id;
			console.log("등록 완료 클릭 후 클릭한 데이터 모델을 이용한 al_id가져오기");
			console.log(al_name_mo);

			await analysis_list.findOne({ where: { al_name: al_name_mo } }).then((res) => {
				const al_list_str = JSON.stringify(res);
				const al_list_value = JSON.parse(al_list_str);
				al_id = al_list_value.al_id;
			});
			console.log(al_time);

			await model_list.create({
				al_time: al_time,
				al_name_mo: al_name_mo,
				data_model_name: data_model_name,
				al_id: al_id,
				dataset_id: "test9999_dataset",
			});
			// 여기서 파일 등록 및 수정이 이뤄저야 한다.
			await model_list.findAll({ limit: 1, where: { al_time: al_time }, order: [["createdAt", "DESC"]] }).then(async (res) => {
				let md_id_str = JSON.stringify(res);
				let md_id_value = JSON.parse(md_id_str)[0];
				const md_id = md_id_value.md_id;

				model_des.create({
					des_id: md_id,
					des_text: md_desc,
				});
				for (i in input_param_obj) {
					const l = input_param_obj[i];
					model_input.create({ ip_id: md_id, ip_param: Object.values(l)[0], ip_value: Object.values(l)[1] });
				}
			});
			return;
		}
	},

	// 등록 페이지 이동
	register_init: async (req, res) => {
		res.redirect(`/model_register_board`);
	},

	// 모델 상태 관리 선택 페이지 이동
	status_update: async (req, res) => {
		const { md_id } = req.body;
		const selected_model = await model_list.findOne({ where: { md_id: md_id } }).then((result) => result.run_status);
		return res.redirect(`model_manage_board/${md_id}?status=${selected_model}`);
	},
	// 모델 상태 관리 선택; 실행 Or 중지
	edit: async (req, res) => {
		try {
			const { new_status } = req.body;
			const md_id = req.params.md_id;
			await model_list.update({ run_status: new_status }, { where: { md_id: md_id } });
			return res.redirect("/model_manage_board");
		} catch (err) {
			console.log("model status error");
		}
	},
	// 모델 삭제
	delete: async (req, res) => {
		const delModelList = req.body.delModel.split(",");
		delModelList.map((el) => {
			model_list.destroy({ where: { md_id: el } });
		});
		res.redirect("/model_manage_board");
	},
};

module.exports = {
	output,
	process,
};
