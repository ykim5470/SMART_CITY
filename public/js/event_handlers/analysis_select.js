const axios = require("axios");

const analysis_select = (socket) => {
  try {
    let al_name_mo_obj = new Object();
    socket.on("분석 모델 선택", async (data) => {
      console.log(data);
      const {
        model_type,
        model_namespace,
        model_version,
        selected_processed_dataset_id,
      } = data;

      // 데이터 모델 JSON get
      const selected_analysis_data_model = await axios.get(
        `http://203.253.128.184:18827/datamodels/${model_namespace}/${model_type}/${model_version}`,
        { headers: { Accept: "application/json" } }
      );

  
      // console.log(selected_analysis_data_model.data);
    socket.emit('분석 모델 선택 완료 및 JSON calling', selected_analysis_data_model.data)
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = analysis_select;
