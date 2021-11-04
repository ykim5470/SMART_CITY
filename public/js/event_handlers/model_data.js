const { model_list, model_input, model_des, atch_file_tb } = require("../../../models");

const get_model_name = async (md_id) => {
  return await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["md_name"] })
    .then((result) => {
      return result;
    });
};

const get_al_time = async (md_id) => {
  return await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["al_time"] })
    .then((result) => {
      return result;
    });
};

const get_date_look_up = async (md_id) => {
  return await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["date_look_up"] })
    .then((result) => {
      return result;
    });
};

const get_data_model = async (md_id) => {
  return await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["data_model_name"] })
    .then((result) => {
      return result;
    });
};

const get_sub_data = async (md_id) => {
  return await model_list
    .findOne({ where: { md_id: md_id }, attributes: ["sub_data"] })
    .then((result) => {
      return result;
    });
};

const get_user_param = async (md_id) => {
  return await model_input
    .findAll({
      where: { md_id: md_id },
      attributes: [
        "ip_param",
        "ip_order",
        "ip_value",
        "ip_type",
        "ip_load",
        "ip_param_type",
      ],
    })
    .then((result) => {
      return result.map((el) => {
        return el.dataValues;
      });
    });
};

const get_selected_processed_dataset = async (md_id) => {
  try {
    return await model_list
      .findOne({ where: { md_id: md_id }, attributes: ["processed_model"] })
      .then((result) => {
        return result;
      });
  } catch (err) {
    console.log(err);
  }
};

const get_desc = async (md_id) => {
  return await model_des
    .findOne({ where: { des_id: md_id }, attributes: ["des_text"] })
    .then((result) => {
      return result;
    });
};

const file_name = async(md_id) =>{
  return await model_list.findOne({where:{md_id: md_id}, attributes: ['file_id']}).then(
    result =>{
      const {file_id} = result
      return atch_file_tb.findOne({where: {file_id: file_id}, attributes:['originalname']}).then(
        response => {return response}
      )
    }
  )
}

const file_format = async(md_id) =>{
  return await model_list.findOne({where: {md_id: md_id}, attributes: ['analysis_file_format']}).then(
    result => {
    return result
    }
  )
}

const model_data = async (socket) => {
  // GET model id
  socket.on("model_uuid", async (data) => {
    const { md_id } = data;

    get_model_name(md_id).then((result) => {
      const { md_name } = result;
      socket.emit("model_name", { md_name: md_name });
    });

    get_al_time(md_id).then((result) => {
      const { al_time } = result;
      socket.emit("al_time", { al_time: al_time });
    });

    get_date_look_up(md_id).then((result) => {
      const { date_look_up } = result;
      socket.emit("date_look_up", { date_look_up: date_look_up });
    });

    get_data_model(md_id).then((result) => {
      const { data_model_name } = result;
      socket.emit("data_model_name", { data_model_name: data_model_name });
    });

    get_sub_data(md_id).then((result) => {
      const { sub_data } = result;
      socket.emit("sub_data", { sub_data: JSON.parse(sub_data) });
    });

    get_user_param(md_id).then((result) => {
      socket.emit("input_param", result);
    });

    get_desc(md_id).then((result) => {
      const { des_text } = result;
      socket.emit("model_des", { model_des: des_text });
    });

    get_selected_processed_dataset(md_id).then((result)=>{
      const {processed_model} = result;
      socket.emit('processed_model', {processed_model: processed_model})
    }) 

    file_name(md_id).then(result=>{
      const {originalname} = result
      socket.emit('file_name', {originalname : originalname})
    })

    file_format(md_id).then(result=>{
      const {analysis_file_format} = result
      socket.emit('analysis_file_format', {analysis_file_format: analysis_file_format})
    })

    return;
  });
};

module.exports = model_data;
