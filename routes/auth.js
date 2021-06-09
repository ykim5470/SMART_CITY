const db = require("../models");
const { model_list, model_output, model_input, atch_file_tb } = require("../models");

// Get
const output = {
	model_manage_board: async (req, res) => {
		const md_id = 1
		try {
			const data = await model_list.findAll({
				include: [{model: model_list, include: [{model: model_output}] }]
			})
			console.log(data)
			return res.render("model/model_manage_board");
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},

	model_register_board: async (req, res) => {
		try {
			const data = await model_list.findAll();
			return res.render("model/model_register_board");
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},

	
};

// Post
const process = {
	model_register_board: async (req, res) => {
		const { al_time, data_name, run_status, ip_value, ip_param, op_value, op_param } = req.body;
		try {
			if (req.file != undefined) {
				const { originalname, mimetype, path, filename } = req.file;
				const table_data = await atch_file_tb.create({ originalname, mimetype, path, filename });
			}
			const model_data = await model_list.create({ al_time, data_name});
			const input_data = await model_input.create({ ip_value, ip_param });
			const output_data = await model_output.create({ op_value, op_param });
			return res.render("model/model_register_board", {});
		} catch (err) {
			console.log(err)
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

// // User Get single data page
// router.get('/users/:uuid',async(req,res)=>{
//     const uuid = req.params.uuid
//     try{
//         const user = await User.findOne({
//             where: {uuid}
//         })
//         return res.json(user)
//     }catch(err){
//         // console.log(err)
//         return res.status(500).json({error: 'Something went wrong'})
//     }
// })

module.exports = {
	output,
	process,
};
