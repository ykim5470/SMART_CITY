const express = require('express')
const router = express.Router()
const { model_list, model_output, model_input } = require('../models')

// 모델 관리 대시보드
// router.get('/model_manage_board', (req, res) => {
//     console.log('This is model management board')
    
// })


// 모델 관리 대시보드 페이지 
router.get('/model_manage_board', (req, res) => {
   return res.render('model/model_manage_board', {data: 'a'})
})

module.exports = router
