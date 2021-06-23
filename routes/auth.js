const { model_list, model_output, model_input, atch_file_tb, analysis_list, dataset, sequelize, column_tb } = require("../models");
const axios = require("axios");

// Get
const output = {

	// socket test
	test: (req, res) => {
		res.render('model/test')
	}
	,
	// 모델 관리 보드
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

	// 모델 등록 보드
	model_register_board: async (req, res) => {
		const {dataset_id} = req.query
		console.log("----------------------------------------------");
		if (dataset_id != undefined) {
			console.log('데이터 선택 후')
			const { dataset_id } = req.query;
			const input_queries = dataset_id.split(",");
			const input_attr = ["id", "type", "name", "version"];
			const attr_obj = Object.fromEntries(input_attr.map((key, index) => [key, input_queries[index]]));
			const input_items = await axios.get(`http://203.253.128.184:18827/datamodels/${attr_obj.name}/${attr_obj.type}/${attr_obj.version}`, { headers: { Accept: "application/json" } }).then((res) => {
				const analysis_models = res.data;
				const input_attributes = analysis_models.attributes.map((el) => {
					const attributes_name = el.name;
					const attributes_value_type = el.valueType;
					return { attributes_name, attributes_value_type };
				});
				return input_attributes;
			});
			console.log(attr_obj.id)
			console.log(input_items)
			await analysis_list
				.findAll({
					attributes: ["al_name"],
				})
				.then((result) => {
					const str = JSON.stringify(result);
					const newValue = JSON.parse(str);
					const dataset_name = output.dataset_select();
					dataset_name.then((result) => {

						const selected_key = result.filter(el => {
							if (el.value.id === attr_obj.id) {
								console.log(typeof (el.key))
								console.log(el.key)
								return el.key
							}
						})
						res.render(`model/model_register_board`, { al_name_mo: newValue, dataset_name: result, input_items: input_items, selected_key: selected_key[0].key});
					});
				});
		} else {
			console.log("----------------------------------------------");
			console.log('데이터 선택 전')
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
		}
	}
};

// Post
const process = {
	// Analysis file upload metadata create
	file_add: async (req, res) => {
		console.log(req.file);
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
				return originalname;
			}
		} catch (err) {
			return res.status(500).json({
				error: "file upload failed",
			});
		}
	},

	// Input table add
	input_add: async (req, res) => {
		console.log("인풋");
		const body = req.body;

		//const dataset_obj = JSON.parse(dataset_id);
		// const type = req.params.type;
		// const namespace = req.params.namespace;
		const get_input_attr = await axios.get(`http://203.253.128.184:18827/datamodels/${body.namespace}/${body.type}/1.0`, { headers: { Accept: "application/json" } }).then((res) => {
			const analysis_models = res.data;
			const input_attributes = analysis_models.attributes.map((el) => {
				const attributes_name = el.name;
				const attributes_value_type = el.valueType;
				return { attributes_name, attributes_value_type };
			});
			return input_attributes;
		});
		console.log(get_input_attr);
		// res.redirect('/model_register_board')
		// console.log(get_input_attr)
		//return get_input_attr;
		return "dddddd";
		// 데이터를 다른 페이지로 보내 줄 지, 현재 페이지에 업데이트 할 지 창희 선임 연구원님께 여쭤보기
	},

	ip_mapping: (req, res) => {
		console.log("인풋 매칭 완료 ");
		const { user_input_param } = req.body;
		// console.log(user_input_param)
	},
	// Output table add
	output_add: async (req, res) => {
		console.log("아웃풋");
		const { al_name_mo } = req.body;
		model_list.create({ al_name_mo: al_name_mo });
		const analysis_output = await analysis_list.findOne({ where: { al_name: al_name_mo } }).then((res) => {
			const al_list_str = JSON.stringify(res);
			const al_list_value = JSON.parse(al_list_str);
			const al_id = al_list_value.al_id;
			const column_attr = column_tb.findOne({ where: { al_id_col: al_id } }).then((result) => {
				const column_str = JSON.stringify(result);
				const column_value = JSON.parse(column_str);
				return column_value;
			});
			return column_attr;
		});
		console.log(analysis_output);
		res.redirect("/model_register_board");
		return analysis_output;
		// 데이터를 다른 페이지로 보내 줄 지, 현재 페이지에 업데이트 할 지 창희 선임 연구원님게 여쭤보기
	},

	// Redirect to model manage board being registerd
	register_complete: async (req, res) => {
		const { al_time } = req.body;
		await model_list.create({
			al_time: al_time,
		});

		const file_md_name = process.file_add(req); // upload file info & return that originalname

		await file_md_name.then((resolve) => {
			const modified_md_name = resolve.split(".")[0]; // file.pb -> file

			model_list.findOne({ where: { al_time: al_time } }).then((res) => {
				const test_str = JSON.stringify(res);
				const test_value = JSON.parse(test_str);
				model_list.update({ md_name: modified_md_name }, { where: { id: test_value.id } });
			});
		});

		res.redirect("/model_manage_board");
		return;
	},

	register_init: async (req, res) => {
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
		const delModelList = req.body.delModel.split(",");
		console.log(delModelList);
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
