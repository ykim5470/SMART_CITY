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
		model_list.findAll({ where: { md_id: md_id }, include: [{ model: model_des, required: false }, { model: model_input, required: false }], raw: true }).then(result => {
			console.log(JSON.parse(JSON.stringify(result)))
			// console.log(result.al_time)
			// console.log(result.model_des.des_text)
			
			res.render(`model/model_register_board_edit`, { md_id: md_id });
		})

		
	},

  test001: async (req, res) => {
    console.log("ttt")
    res.render("ui/index");
  },
  test002: async (req, res) => {
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
						res.render(`ui/test01`, { al_name_mo: newValue, dataset_name: result, input_items: [] });
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
const process = {};

module.exports = {
  output,
  process,
};
