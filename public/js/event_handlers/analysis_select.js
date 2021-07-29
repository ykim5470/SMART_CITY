const { analysis_list, column_tb } = require("../../../models");

const analysis_select = (socket) => {
  let al_name_mo_obj = new Object();
  socket.on("분석 모델 선택", (data) => {
    const { al_name_mo } = data;
    al_name_mo_obj = { al_name_mo };

    const analysis_output = async () => {
      const analysis_column = await analysis_list
        .findOne({ where: { type: al_name_mo } })
        .then((res) => {
          const al_list_str = JSON.stringify(res);
          const al_list_value = JSON.parse(al_list_str);
          const al_id = al_list_value.al_id;
          const column_attr = column_tb
            .findAll({ where: { al_id_col: al_id } })
            .then((result) => {
              const column_str = JSON.stringify(result);
              const column_value = JSON.parse(column_str);
              return column_value;
            });
          return column_attr;
        });
      return analysis_column;
    };
    analysis_output().then((res) => {
      socket.emit("분석 모델 선택 완료 및 아웃풋 calling", res);
    });
  });
};

module.exports = analysis_select;
