const express = require("express");
const router = express.Router();
const { model_list, model_output, model_input } = require("../models");

// 모델 관리 대시보드 페이지
router.get("/model_manage_board", async (req, res) => {
	try {
		const data = await model_list.findAll();
		return res.render("model/model_manage_board", { test: "a", allList: data });
	} catch (err) {
		return res.status(500).json({ error: "Something went wrong" });
	}
});

const out = {
    ttt :  async (req, res) => {
    try {
        const data = await model_list.findAll()
        return res.render('model/model_manage_board', { test: 'a', allList: data })
    }catch(err){
        return res.status(500).json({error: 'Something went wrong'})
    }
}
}

module.exports = router;
