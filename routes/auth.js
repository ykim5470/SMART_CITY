const { model_list, model_output, model_input, atch_file_tb, analysis_list } = require("../models");

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
					const newValue = JSON.parse(str);
					return res.render(`model/model_manage_board`, { list_data: newValue });
				});
		} catch (err) {
			return res.status(500).json({
				error: "Something went wrong",
			});
		}
	},

	manage_status: async (req, res) => {
		const { status } = req.query;
		const { md_id } = req.params;
		return res.render("model/model_status", { current_status: status, md_id: md_id });
	},

	model_register_board: async (req, res) => {
		try {
			await analysis_list
				.findAll({
					attributes: ["al_name"],
				})
				.then((result) => {
					const str = JSON.stringify(result);
					const newValue = JSON.parse(str);
					res.render("model/model_register_board", { al_name_mo: newValue });
					return;
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
		try {
			await model_list.create({
				al_time,
				md_name,
				al_name_mo,
			});
		} catch (err) {
			console.log(err);
		}
	},
	// Input table add
	input_add: async (req, res) => {
		const { in_value, in_param } = req.body;
		try {
			await model_input.create({
				ip_value,
				ip_param,
			});
		} catch (err) {
			console.log(err);
		}
	},
	// Output table add
	output_add: async (req, res) => {
		const { op_value, op_param } = req.body;
		try {
			await model_output.create({
				op_value,
				op_param,
			});
		} catch (err) {
			console.log(err);
		}
	},
	// Redirect to model manage board being registerd
	register_complete: async (req, res) => {
		process.file_add(req, res);
		process.list_add(req, res);
		process.input_add(req, res);
		process.output_add(req, res);
		return await res.redirect("/model_manage_board");
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
		const { md_id } = req.body
		await model_list.destroy({ where: { md_id: md_id } })
		res.redirect('/model_manage_board')
	},
};

module.exports = {
	output,
	process,
};
