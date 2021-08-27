const tf = require("@tensorflow/tfjs-node");
const tensor_shape_convert = (
  analysis_file_format,
  op_data_value,
  user_input_value,
  single_processed_data_result,
  url
) => {
    // console.log(single_processed_data_result)
    // console.log(user_input_value)
    // console.log(op_data_value)

  // 그래프 모델
  if (analysis_file_format === "loadGraphModel") {
    const model = tf.loadGraphModel(url).then((models) => {
      // var tensor_shape_object = new Object();
      // user_input_value.map(
      //   (el) => (tensor_shape_object[el.ip_value] = el.ip_param_type)
      // );
  
      // var tensor_shape_stringify = Object.values(tensor_shape_object);

      // var tensor_shape_applied_data = Object.values(
      //   single_processed_data_result
      // ).map((item, idx) => {
      //   var tensor_shape_parsed = JSON.parse(
      //     JSON.parse(tensor_shape_stringify[idx])
      //   );

      //   return tf.reshape(tf.tensor(item), tensor_shape_parsed);
      // });

      // let zipped_input = new Object();

      // var model_inputs_name_list = models.executor.graph.inputs;

      // // 필수 변수 값에 변환 텐서 할당
      // model_inputs_name_list.map(
      //   (el, idx) => (zipped_input[el.name] = tensor_shape_applied_data[idx])
      // );

      // models.predict(zipped_input).print();
      // const tensor_output = models.predict(zipped_input)
      // const values = tensor_output.dataSync()
      // const arr = Array.from(values)
      // console.log(arr)

      console.log("그래프 모델 실행 완료");
    });
    return model;
  } else if (analysis_file_format === "loadLayersModel") {
    console.log(single_processed_data_result)
    // 레이어 모델
    const model = tf.loadLayersModel(url).then((models) => {
      var tensor_shape_object = new Object();
      user_input_value.map(
        (el) => (tensor_shape_object[el.ip_value] = el.ip_param_type)
      );

      var tensor_shape_stringify = Object.values(tensor_shape_object);

      var tensor_shape_applied_data = Object.values(
        single_processed_data_result
      ).map((item, idx) => {
        var tensor_shape_parsed = JSON.parse(
          JSON.parse(tensor_shape_stringify[idx])
        );

        return tf.reshape(tf.tensor(item), tensor_shape_parsed);
      });


      let zipped_input = new Object();


      // // 필수 변수 값에 변환 텐서 할당
      user_input_value.map(
        (el, idx) => (zipped_input[el.ip_value] = tensor_shape_applied_data[idx])
      );
  
      // 변수 순서 ordering
        let zipped_array = new Array
        user_input_value.map(el => {
          zipped_array[el.ip_value] = el.ip_order
        })

        var sorted_zipped_input_obj = Object.fromEntries(
          Object.entries(zipped_array).sort(([, a], [, b]) => a - b)
        )

        var sorted_zipped_input = Object.keys(sorted_zipped_input_obj).map(el => zipped_input[el])
        console.log(sorted_zipped_input)
      
        var predicted_outputs = models.predict(sorted_zipped_input)
        
      console.log("레이어 모델 실행 완료");
      return [predicted_outputs, op_data_value]
    });
    return model;
  } else {
    throw "잘못 된 분석 파일 포맷입니다. 레이어 혹은 그래프 모델을 올려주세요";
  }
};

module.exports = tensor_shape_convert;
