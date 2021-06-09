const { model_list, model_output, model_input, atch_file_tb } = require("../models");

// Get
const output = {
	model_manage_board: async (req, res) => {
		try {
			const data = await model_list.findAll();
			return res.render("model/model_manage_board", { data });
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},

	model_register_board: async (req, res) => {
		try {
			const data = await model_list.findAll();
			return res.render("model/model_register_board", { data });
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

// Post
const process = {
	model_register_board: async (req, res) => {
		const { al_time, data_name, run_status, ip_value, ip_param, op_value, op_param, atch_origin_file_name } = req.body;
		console.log(atch_origin_file_name)
		try {
			const table_data = await atch_file_tb.create({  atch_origin_file_name });
			const model_data = await model_list.create({ al_time, data_name, run_status });
			const input_data = await model_input.create({ ip_value, ip_param });
			const output_data = await model_output.create({ op_value, op_param });
			return res.render("model/model_register_board", {});
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

module.exports = {
	output,
	process,
};
