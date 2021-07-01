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
				md_desc_prev = model_edit_value['model_des.des_text']
				

				model_input.findAll({ where: { ip_id: md_id }, attirbutes: ["ip_param", "ip_value"] }).then((results) => {
					const model_input_info_str = JSON.stringify(results);
					const model_input_info_value = JSON.parse(model_input_info_str);
					console.log(model_input_info_value);
					console.log(al_time_prev);
					const dataset_name = output.dataset_select();
					dataset_name.then((outcome) => {
						return res.render(`model/model_register_board_edit`, { md_id: md_id, al_time: al_time_prev, md_name: md_name_prev, al_name_mo: al_name_mo_prev, dataset_name: outcome,md_desc:md_desc_prev });
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
	// 파일 TB Create
	file_add: async (req, res) => {
		const { originalname, mimetype, path, filename } = req.file;
		atch_file_tb.create({
			originalname,
			mimetype,
			path,
			filename,
		});
	},

	// 모델 등록 Complete
	register_complete: async (req, res) => {
		const { al_name_mo, al_time, dataset_id, model_desc, ip_attr_name, user_input_param } = req.body;
		let al_id;
		let file_id;
		let md_id;
		let user_obj = new Object();

		// 파일 TB Create
		await process.file_add(req, res);
		// 분석 모델 TB al_id GET
		await analysis_list.findOne({ where: { al_name: al_name_mo } }).then((res) => {
			const al_list_str = JSON.stringify(res);
			const al_list_value = JSON.parse(al_list_str);
			return (al_id = al_list_value.al_id);
		});
		// 데이터 셋 TB Create
		/* dataset_id Required */

		// 데이터 셋 TB dataset_id GET

		// 파일 TB file_id GET
		await atch_file_tb.findOne({ order: [["createdAt", "DESC"]] }).then((res) => {
			const model_from_file = JSON.stringify(res);
			const model_from_file_value = JSON.parse(model_from_file);
			file_id = model_from_file_value.file_id;
		});

		// 모델 리스트 TB Create
		await model_list
			.create({
									// User ID will be applied to md_name later
				file_id: file_id,
				al_time: al_time,
				al_name_mo: al_name_mo,
				data_model_name: dataset_id,
				al_id: al_id,
				dataset_id: "test9999_dataset", // dataset_id will be applied later
			})
			.then(() => {
				// 생성된 모델 리스트 TB의 md_id GET
				model_list.findAll({ limit: 1, where: { al_time: al_time }, order: [["createdAt", "DESC"]] }).then(async (res) => {
					let md_id_str = JSON.stringify(res);
					let md_id_value = JSON.parse(md_id_str)[0];
					md_id = md_id_value.md_id;
					// 모델 설명 TB Create
					console.log(model_desc)
					model_des.create({
						des_id: md_id,
						des_text: model_desc,
					});
					// 인풋 파람 TB 생성
					user_input_param.filter((el, index) => {
						if (el != "") {
							user_obj[ip_attr_name[index]] = el;
						}
					});
					for (i in user_obj) {
						model_input.create({ip_id: md_id, ip_param: i, ip_value:user_obj[i]})
					}
				});
			});

		return res.redirect("/model_manage_board");
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
