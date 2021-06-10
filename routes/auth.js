
const { model_list, model_output, model_input, atch_file_tb, analysis_list } = require("../models");

// Get
const output = {
	model_manage_board: async (req, res) => {
		try {
			await model_list.findAll({ attributes: { exclude: ["updatedAt"] } }).then((result) => {
				const str = JSON.stringify(result);
				const newValue = JSON.parse(str);
				return res.render("model/model_manage_board", { list_data: newValue });
			});
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},

	model_register_board: async (req, res) => {
		try {
			 await analysis_list.findAll({ attributes: ["al_name"] }).then((result) => {
				const str = JSON.stringify(result);
				const newValue = JSON.parse(str);
				 res.render("model/model_register_board", { al_name_mo: newValue });
				 return 
			});
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

// Post
const process = {
	model_register_board: async (req, res) => {
		const { al_time, data_name, run_status, ip_value, ip_param, op_value, op_param, al_name_mo } = req.body;
		const md_name = (al_name_mo !== null ? al_name_mo.split('.').slice(0, -1).join('.') : 'no_file_selected')
		try {
			if (req.file != undefined) {
				const { originalname, mimetype, path, filename } = req.file;
				const table_data = await atch_file_tb.create({ originalname, mimetype, path, filename });
			}
			const model_data = await model_list.create({ al_time, data_name, al_name_mo, md_name });
			const input_data = await model_input.create({ ip_value, ip_param });
			const output_data = await model_output.create({ op_value, op_param });
			return res.render("model/model_register_board");
		} catch (err) {
			console.log(err);
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

module.exports = {
	output,
	process,
};
