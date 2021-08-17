const { model_list, column_tb } = require("../../../models");
const moment = require("moment");


// 예측 값 전처리 및 JSON화
const predicted_value_JSON = (predicted_values) => {
  const [tensor_predicted_value, model_column_data] = predicted_values;
  let predicted_value_arr = new Array
  let predicted_value_length = tensor_predicted_value.length
  // Tensor to 1d-Array
  for (let i =0; i < predicted_value_length; i++){
    predicted_value_arr.push(tensor_predicted_value[i].arraySync()[0])
  }
  console.log(predicted_value_arr)


  
  console.log("------------------------------");
  console.log(model_column_data);
};

// 데이터 모델 구조 확인
const data_model_structure = (al_id) => {
  let model_entities_obj = new Object
  column_tb.findAll({where: {al_id_col : al_id}, attributes:{exclude: ['createdAt','updatedAt']}}).then((result)=>{
    const column_str = JSON.stringify(result)
    const column_value = JSON.parse(column_str)
    
    // 데이터 모델 속성 body structure
    column_value.map(el => {
      if(el.isRequired === 'true'){
        if(el.valueEnum == null){
          value_key = el.valueType === 'Double' || el.valueType === 'Integer' ? 'value' : 'object'
          let value_key_obj = new Object
          value_key_obj[value_key] = ''
          let attribute_obj = new Object
          attribute_obj['type'] = el.attributeType
          Object.assign(attribute_obj, value_key_obj)
          if(el.hasObservedAt === 'true'){
            observed_time = moment(new Date).format();
            Object.assign(attribute_obj, {observedAt : observed_time})
          }
          model_entities_obj[el.name] = attribute_obj
        }
      }
    })
  })
}

// 최종 적재 과정
const data_upsert_serving = async (predicted_output, md_id) => {
  console.log("test");
  await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["dataset_id", "al_id"] })
    .then((upsert_target_info) => {
      let {dataset_id, al_id} = upsert_target_info
      // console.log(dataset_id)
     

          data_model_structure(al_id)
    });
  predicted_value_JSON(predicted_output);

  // let body = {
  //   "datasetId" 
  // }
};

module.exports = data_upsert_serving;
