
const axios = require("axios");

const dataset_select = (socket)=>{
    let data_selection_obj = new Object();
    socket.on("데이터 선택", (data) => {
        const { dataset_info } = data;
    
        data_selection_obj = { ...data };
        // 선택 된 데이터 개별 센서 데이터 API calling;
        const sub_data_get = async () => {
          const sub_data_queries = dataset_info.split(",");
          const sub_data_attr = ["id", "type", "name", "version"];
          const attr_obj = Object.fromEntries(
            sub_data_attr.map((key, index) => [key, sub_data_queries[index]])
          );
          const sub_data = await axios
            .get(
              `http://203.253.128.184:18227/entities?Type=${attr_obj.name}.${attr_obj.type}:${attr_obj.version}&datasetId=${attr_obj.id}`,
              { headers: { Accept: "application/json" } }
            )
            .then((res) => {
              return res.data;
            });
          return sub_data;
        };
        sub_data_get().then((res) => {
          socket.emit("데이터 선택 완료 및 개별 센서 데이터 calling", res);
        });
    
        // 선택 된 데이터 API calling; attributes GET
        const attr_get = async () => {
          const input_queries = dataset_info.split(",");
          const input_attr = ["id", "type", "name", "version"];
          const attr_obj = Object.fromEntries(
            input_attr.map((key, index) => [key, input_queries[index]])
          );
          const input_items = await axios
            .get(
              `http://203.253.128.184:18827/datamodels/${attr_obj.name}/${attr_obj.type}/${attr_obj.version}`,
              { headers: { Accept: "application/json" } }
            )
            .then((res) => {
              return res.data;
            });
          return input_items;
        };
        attr_get().then((res) => {
          socket.emit("데이터 선택 완료 및 인풋 calling", res.attributes);
        });
      });

} 

module.exports = dataset_select