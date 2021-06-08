const express = require('express')
const router = express.Router()

const { model_list, model_output, model_input } = require('../models')


// 모델 등록 대시보드
router.get('/model_register_board', (req, res) => {
    console.log('This is model registry board')
})
