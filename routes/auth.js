// Get
const output = {
	model_manage_board: async (req, res) => {
		try {
			// const data = await model_list.findAll();
			return res.render("model/model_manage_board", {  });
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},

	model_register_board: async (req, res) => {
		try {
			// const data = await model_list.findAll();
			return res.render("model/model_register_board", {  });
		} catch (err) {
			return res.status(500).json({ error: "Something went wrong" });
		}
	},
};

// Post
const process = {};

module.exports = {
	output,
	process,
};
