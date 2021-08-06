const tf = require("@tensorflow/tfjs-node");
const tensor_shape_convert = (
  analysis_file_format,
  single_processed_data_result,
  user_input_value,
  url
) => {
  // 그래프 모델
  if (analysis_file_format === "loadGraphModel") {
    const model = tf.loadGraphModel(url).then((models) => {
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

      var model_inputs_name_list = models.executor.graph.inputs;

      // 필수 변수 값에 변환 텐서 할당
      model_inputs_name_list.map(
        (el, idx) => (zipped_input[el.name] = tensor_shape_applied_data[idx])
      );

      models.predict(zipped_input).print();
      const tensor_output = models.predict(zipped_input)
      const values = tensor_output.dataSync()
      const arr = Array.from(values)
      console.log(arr)

      console.log("그래프 모델 실행 완료");
    });
    return model;
  } else if (analysis_file_format === "loadLayersModel") {
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

      var model_inputs_name_list = models.inputNames;

      // 필수 변수 값에 변환 텐서 할당
      model_inputs_name_list.map(
        (el, idx) => (zipped_input[el.name] = tensor_shape_applied_data[idx])
      );

      models.predict(zipped_input).print();

      const tensor_output = models.predict(zipped_input)
      const values = tensor_output.dataSync()
      const arr = Array.from(values)
      console.log(arr)
      

      console.log("레이어 모델 실행 완료");
    });
    return model;
  } else {
    throw "잘못 된 분석 파일 포맷입니다. 레이어 혹은 그래프 모델을 올려주세요";
  }
};

module.exports = tensor_shape_convert;
