const { model_list, model_output, model_input, atch_file_tb, analysis_list, dataset, sequelize, column_tb } = require("../models");
const axios = require("axios");

// Get
const output = {
	manage_board: async (req, res) => {
		try {
			await model_list
				.findAll({
					attributes: {
						exclude: ["updatedAt"],
					},
				})
				.then((result) => {
					const str = JSON.stringify(result);
					const new_value = JSON.parse(str);
					return res.render(`model/model_manage_board`, { list_data: new_value });
				});
		} catch (err) {
			return res.status(500).json({
				error: "Something went wrong",
			});
		}
	},

	// Database select register info
	dataset_select: async (req, res) => {
		const dataset = await axios.get("http://203.253.128.184:18827/datasets", { headers: { Accept: "application/json" } });
		const dataset_dict = [];
		dataset.data.filter((el) => {
			return dataset_dict.push({ key: el.name, value: { id: el.id, dataModelType: el.dataModelType, dataModelNamespace: el.dataModelNamespace } });
		});
		return dataset_dict;
	},

	manage_status: async (req, res) => {
		const { status } = req.query;
		const { md_id } = req.params;
		return res.render("model/model_status", { current_status: status, md_id: md_id });
	},

	model_register_board: async (req, res) => {
		console.log("모델 등록 get");
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
						res.render(`model/model_register_board`, { al_name_mo: newValue, dataset_name: result });
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
	// Analysis file upload metadata create
	file_add: async (req, res) => {
		try {
			if (req.file != undefined) {
				const { originalname, mimetype, path, filename } = req.file;
				// e.g. dataSoil.txt, text/plain, uploads/1623xx.txt, 1623xx.txt
				await atch_file_tb.create({
					originalname,
					mimetype,
					path,
					filename,
				});
			}
		} catch (err) {
			return res.status(500).json({
				error: "file upload failed",
			});
		}
	},
	// Model register info add
	list_add: async (req, res) => {
		const { al_time, md_name, al_name_mo } = req.body;
		console.log(al_time);
		console.log(al_name_mo);
		try {
			await model_list.create({
				al_time: al_time,
				md_name: md_name,
				al_name_mo: al_name_mo,
			});
		} catch (err) {
			console.log(err);
		}
	},

	// Input table add
	input_add: async (req, res) => {
		console.log("인풋");
		const { ip_value, ip_param, dataset_id } = req.body;
		const dataset_obj = JSON.parse(dataset_id);
		const get_input_attr = await axios.get(`http://203.253.128.184:18827/datamodels/${dataset_obj.namespace}/${dataset_obj.type}/1.0`, { headers: { Accept: "application/json" } }).then((res) => {
			const analysis_models = res.data;
			const input_attributes = analysis_models.attributes.map((el) => {
				const attributes_name = el.name;
				const attributes_value_type = el.valueType;
				return { attributes_name, attributes_value_type };
			});
			return input_attributes;
		});
		console.log(get_input_attr);
		return get_input_attr;
		// 데이터를 다른 페이지로 보내 줄 지, 현재 페이지에 업데이트 할 지 창희 선임 연구원님께 여쭤보기
	},
	// Output table add
	output_add: async (req, res) => {
		console.log("아웃풋");
		const { al_name_mo } = req.body;
		console.log(typeof al_name_mo);
		const analysis_output = await analysis_list.findOne({ where: { al_name: al_name_mo } }).then((res) => {
			const al_list_str = JSON.stringify(res);
			const al_list_value = JSON.parse(al_list_str);
			const al_id = al_list_value.al_id;
			const column_attr = column_tb.findOne({ where: { al_id_col: al_id } }).then((result) => {
				const column_str = JSON.stringify(result)
				const column_value = JSON.parse(column_str)
				return column_value
			});
			return column_attr			
		});
		console.log(analysis_output)
		return analysis_output
		// 데이터를 다른 페이지로 보내 줄 지, 현재 페이지에 업데이트 할 지 창희 선임 연구원님게 여쭤보기 
	},
	// Redirect to model manage board being registerd
	register_complete: async (req, res) => {
		console.log("등록 완료 및 funtion실행");
		// process.file_add(req, res);
		// process.list_add(req, res);
		// process.input_add(req, res);
		// process.output_add(req, res);
		return await res.redirect("/model_manage_board");
	},
	// init_list: async (req, res) => {
	// 	// Init model create
	// 	await model_list.create({});
	// 	// new model md_id
	// 	const current_md_id = model_list.findAll({ limit: 1, order: [["createdAt", "DESC"]] }).then((result) => {
	// 		const init_model = JSON.stringify(result);
	// 		const init_model_value = JSON.parse(init_model);
	// 		working_md_id = init_model_value[0].md_id;
	// 		return working_md_id;
	// 	});
	// 	return current_md_id;
	// },
	//
	register_init: async (req, res) => {
		console.log("등록 클릭 완료, model_register_board 페이지로 이동");
		res.redirect(`/model_register_board`);
	},
	// Identify selected model
	status_update: async (req, res) => {
		const { md_id } = req.body;
		const selected_model = await model_list.findOne({ where: { md_id: md_id } }).then((result) => result.run_status);
		return res.redirect(`model_manage_board/${md_id}?status=${selected_model}`);
	},
	// Edit selected model status
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
	delete: async (req, res) => {
		const { md_id } = req.body;
		await model_list.destroy({ where: { md_id: md_id } });
		res.redirect("/model_manage_board");
	},
};

module.exports = {
	output,
	process,
};
