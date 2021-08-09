const {model_list, dataset} = require('../../../models')


// 예측 값 전처리 및 JSON화
const predicted_value_JSON = (predicted_values) => {
  const [tensor_predicted_value, model_column_data] = predicted_values;
  console.log(tensor_predicted_value)
  console.log('------------------------------')
  console.log(model_column_data)
};

// 최종 적재 과정
const data_upsert_serving = (predicted_output, md_id) => {
  console.log("test");
    model_list.findOne({where: {md_id: md_id}, attributes: ['al_id']}).then((analysis_list_id) => {
        dataset.findAll({where: {ds_id :analysis_list_id}, attributes: [
            'dataset_id'
        ]}).then((dataset_id_result)=>{
            console.log(dataset_id_result) // waterDataset018
        })
    }
    )
  predicted_value_JSON(predicted_output);
};

module.exports = data_upsert_serving;
