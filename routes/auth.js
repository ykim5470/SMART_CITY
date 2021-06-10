const { model_list, model_output, model_input, atch_file_tb, analysis_list } = require("../models");
const url = require('url');


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
				return;
			});
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

// Post
const process = {
	model_register_board: async (req, res) => {
		const { al_time, md_name, run_status, ip_value, ip_param, op_value, op_param, al_name_mo } = req.body;
		try {
			// Analysis file upload metadata create
			if (req.file != undefined) {
				const { originalname, mimetype, path, filename } = req.file;
				// e.g. dataSoil.txt, text/plain, uploads/1623xx.txt, 1623xx.txt
				await atch_file_tb.create({ originalname, mimetype, path, filename });
			}

			// Model register info submitted
			// e.g. 분석시간, 모델 이름, 분석 모델
			await model_list.create({ al_time, md_name, al_name_mo });

			// Input data submitted
			await model_input.create({ ip_value, ip_param });

			// Output data submitted
			await model_output.create({ op_value, op_param });

			// Redirect to manage_board
			return res.redirect('/model_manage_board')
		} catch (err) {
			console.log(err);
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};


// Put
const update = {
	model_manage_board: async (req, res) => { 
		const { run_status } = req.params.md_id
		console.log(run_status)
		try {
			await model_list.update({ run_status: run_status })
			return res.render("model/model_manage_board");
		} catch (err) {
			return req.status(500).json({error: "Something went wrong"})
		}
	}
}



module.exports = {
	output,
	process,
	update
};
