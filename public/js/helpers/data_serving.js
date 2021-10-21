const { model_list, model_output } = require("../../../models");
const axios = require("axios");
const { predict_time_generator } = require("../helpers/api_scheduler");
const moment = require('moment');

function check_recursion(single_sequence, last_value) {
  var sequence_key_position_length = single_sequence.length;
  while (sequence_key_position_length > 0) {
    var increment = 0;
    let element = single_sequence[increment]; 
    last_value_arg = last_value[element]
    increment += 1;
    single_sequence.shift();
    return check_recursion(single_sequence, last_value_arg);
  }
  return last_value;
}

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function getAllIndexes(arr, val) {
  var indexes = [],
    i = -1;
  while ((i = arr.indexOf(val, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
}

function valueTypeCheck(valueType) {
  switch (valueType) {
    case "String":
      temp_value = "";
      break;
    case "Integer":
      temp_value = null;
      break;
    case "Double":
      temp_value = null;
      break;
    case "Object":
      temp_value = new Object();
      break;
    case "Date":
      temp_value = "";
      break;
    case "ArrayString":
      temp_value = new Array();
      break;
    case "ArrayInteger":
      temp_value = new Array();
      break;
    case "ArrayDouble":
      temp_value = new Array();
      break;
    case "ArrayObject":
      temp_value = new Array();
      break;
    case "GeoJson":
      temp_value = new Object();
      break;
    default:
      break;
  }
  return temp_value;
}

const data_model_get = async (model_type, model_namespace, model_version) => {
  try {
    return axios
      .get(
        `http://203.253.128.184:18827/datamodels/${model_namespace}/${model_type}/${model_version}`,
        { headers: { Accept: "application/json" } }
      )
      .then((result) => {
        return result.data;
      });
  } catch (err) {
    console.log(err);
  }
};

// 데이터 예측 선택 및 실제 값 맵핑
const data_mapping = async (predicted_output, md_id) => {
  try {
    let temp_obj = new Object();
    let final_array = new Array();

    let max_length = predicted_output[0].dataSync().length;
    for (let j = 0; j < predicted_output.length; j++) {
      max_length =
        max_length > predicted_output[j].dataSync().length
          ? max_length
          : predicted_output[j].dataSync().length;
    }

    const output_sequence = await model_output
      .findOne({
        where: { op_id: md_id },
        attributes: ["op_sequence", "op_date_look_up"],
      })
      .then(async(res) => {
        const { op_sequence, op_date_look_up } = res;
        const op_sequence_list = op_sequence.split(",");

        const predicted_time_list = new Array();
        let l = 0;
        let current_time = new Date();
        while (l < max_length) {
          let start_time = predict_time_generator(
            JSON.parse(op_date_look_up),
            current_time
          );
          predicted_time_list.push(start_time);
          current_time = start_time;
          l += 1;
        }

       let model_info = await model_list.findOne({where: {md_id: md_id}, attributes: ['processed_model']}).then(result => {
          const {processed_model}  = result 
          
          let model_type = processed_model.split(',')[0]
          let model_namespace =processed_model.split(',')[1]
          let model_version = processed_model.split(',')[2]
          return {'model_type': model_type, 'model_namespace': model_namespace, 'model_version': model_version}
        })
 
        model_type = model_info.model_type
        model_namespace = model_info.model_namespace
        model_version = model_info.model_version

        const user_arr = data_model_get(model_type, model_namespace, model_version).then((result) => {
          let i = 0;
          op_sequence_list.map((el) => {
            var to_string = el.replace(/'/gi, "").split(".");

            var name_check = check_recursion(to_string, result.attributes);

            if (name_check == "predictedAt") {
              temp_obj[el.replace(/'/gi, "")] = predicted_time_list;
            } else {
              temp_obj[el.replace(/'/gi, "")] = Array.from(
                predicted_output[i].dataSync()
              );
              ++i;
            }
            final_array.push(temp_obj);
            temp_obj = {};
          });
          return temp_obj;
        });

        return user_arr;
      });
    // final_array.push(output_sequence)
    return final_array;
  } catch (err) {
    console.log(err);
  }
};

// 최종 적재 과정
const data_upsert_serving = async (predicted_output, md_id) => {
  try {
    let model_info = await model_list.findOne({where: {md_id: md_id}, attributes: ['processed_model']}).then(result => {
      const {processed_model} = result 
      let model_type = processed_model.split(',')[0]
      let model_namespace =processed_model.split(',')[1]
      let model_version = processed_model.split(',')[2]

      return {model_type: model_type, model_namespace: model_namespace, model_version : model_version}
    })

    model_type = model_info.model_type
    model_namespace = model_info.model_namespace
    model_version = model_info.model_version
    const data = await data_model_get(model_type, model_namespace, model_version).then(async (result) => {
      // 데이터 예측 맵핑
      var user_arr = await data_mapping(predicted_output, md_id);

      // 적재 JSON body 구성
      const f = new Array();

      // Attribute constructor
      function Attribute(
        name,
        isRequired,
        valueType,
        objectMembers,
        attributeType,
        hasObservedAt,
        childAttributes
      ) {
        this.name = name;
        this.isRequired = isRequired;
        this.valueType = valueType;
        this.objectMembers = objectMembers;
        this.attributeType = attributeType;
        this.hasObservedAt = hasObservedAt;
        this.childAttributes = childAttributes;
        this.depth = 0;
        this.temp_arr = new Array();
        this.instance_index = 0;

        // Create Instance JSON
        this.createJSON = async (user_arr) => {
          var instance = new Object();
          let attrType = "";
          let temp_value;
          switch (this.attributeType) {
            case "Property":
              attrType = "value";
              break;
            case "GeoProperty":
              attrType = "GeoProperty";
              break;
            case "Relationship":
              attrType = "object";
              break;
            default:
              break;
          }
          switch (this.valueType) {
            case "String":
              temp_value = "";
              break;
            case "Integer":
              temp_value = null;
              break;
            case "Double":
              temp_value = null;
              break;
            case "Object":
              temp_value = new Object();
              break;
            case "Date":
              temp_value = "";
              break;
            case "ArrayString":
              temp_value = new Array();
              break;
            case "ArrayInteger":
              temp_value = new Array();
              break;
            case "ArrayDouble":
              temp_value = new Array();
              break;
            case "ArrayObject":
              temp_value = new Array();
              break;
            case "GeoJson":
              temp_value = new Object();
              break;
            default:
              break;
          }

          var objectMember_obj = new ObjectMember(
            this.name,
            this.valueType,
            this.objectMembers
          );

          instance[this.name] = {
            type: this.attributeType,
          };


          let value_key = new Object();
          if (this.objectMembers != undefined) {

            const object_attributeType = objectMember_obj.insert(
              user_arr,
              this.instance_index
            );
          

            value_key[attrType] = object_attributeType[0];
          } else {
            value_key[attrType] = temp_value;
          }
          let type_value_obj = { ...instance[this.name], ...value_key };
          

          let observedTime = new Object();
          if (this.hasObservedAt) {
            var moment_time = moment(moment(Date.now())).toISOString(true).split('.')
            var observed_time = moment_time.join(',')
            observedTime["observedAt"] = observed_time;
            instance[this.name] = {
              ...type_value_obj,
              ...observedTime,
            };
          } else {
            instance[this.name] = { ...type_value_obj };
          }

          this.instance_index += 1;
          this.depth -= 1;

          this.temp_arr.push(instance);
          // If depth is not less than 0, update current this value to childAttributes
          if (this.childAttributes != undefined) {
            await this.update_child_attr(this.childAttributes[0]);
          }
          return;
        };

        // If depth is not less than 0, update current this value to childAttributes
        this.update_child_attr = async (childAttribute) => {
          this.name = undefined;
          (this.isRequired = undefined),
            (this.valueType = undefined),
            (this.objectMembers = undefined),
            (this.attributeType = undefined),
            (this.hasObservedAt = undefined),
            (this.childAttributes = undefined);
          for (let [key, value] of Object.entries(childAttribute)) {
            switch (key) {
              case "name":
                this.name = value;
                break;
              case "isRequired":
                this.isRequired = value;
                break;
              case "valueType":
                this.valueType = value;
                break;
              case "objectMembers":
                this.objectMembers = value;
                break;
              case "attributeType":
                this.attributeType = value;
                break;
              case "hasObservedAt":
                this.hasObservedAt = value;
                break;
              case "childAttributes":
                this.childAttributes = value;
                break;
              default:
                break;
            }
          }
          this.get_depth();
        };

        // Add depth
        this.get_depth = function () {
          if (this.childAttributes) {
            this.depth += 1;
            return this.depth;
          }
        };

        this.fill = async (user_arr, attributes) => {
          for (let [key, value] of Object.entries(attributes)) {
            switch (key) {
              case "name":
                this.name = value;
                break;
              case "isRequired":
                this.isRequired = value;
                break;
              case "valueType":
                this.valueType = value;
                break;
              case "objectMembers":
                this.objectMembers = value;
                break;
              case "attributeType":
                this.attributeType = value;
                break;
              case "hasObservedAt":
                this.hasObservedAt = value;
                break;
              case "childAttributes":
                this.childAttributes = value;
                break;
              default:
                break;
            }
          }

          // childAttribute
          this.get_depth();
          while (this.depth >= 0) {
            await this.createJSON(user_arr);
            if (this.depth < -1) {
              break;
            }
          }

          var temp_arr_len = this.temp_arr.length;

          if (temp_arr_len > 1) {
            for (let k = temp_arr_len; k > 0; k--) {
              let attr_name = Object.keys(this.temp_arr[k - 1])[0];
              this.temp_arr[k - 1][attr_name] = {
                ...this.temp_arr[k - 1][attr_name],
                ...this.temp_arr[k],
              };
            }

            return this.temp_arr[0];
          } else {
            return this.temp_arr;
          }
        };
      }

      // Object Members
      function ObjectMember(name, valueType, objectMembers) {
        this.name = name;
        this.valueType = valueType;
        this.objectMembers = objectMembers;
        this.obj = new Object();
        this.arr = new Array();

        this.insert = function (user_arr, instanceIndex) {

          for (let i = 0; i < user_arr.length; i++) {
            var sequence_key = Object.keys(user_arr[i]);
            var sequence_key_position = sequence_key[0].split(".");

            var current_instance_step = getAllIndexes(
              sequence_key_position,
              "childAttributes"
            ).length;
            var nested_object_check = getAllIndexes(
              sequence_key_position,
              "objectMembers"
            ).length;

            var sequence_value = user_arr[i][sequence_key];

            if (
              nested_object_check == 1 &&
              instanceIndex == current_instance_step
            ) {
              this.iter(user_arr, sequence_key_position, sequence_value);
            } else if (
              nested_object_check == 2 &&
              instanceIndex == current_instance_step
            ) {
              this.iter_nested(user_arr, sequence_key_position, sequence_value);
            }
          }

          return this.arr;
        };

        this.iter_nested = function (
          user_arr,
          sequence_key_position,
          sequence_value
        ) {
          var objectMembers_indexes = getAllIndexes(
            sequence_key_position,
            "objectMembers"
          ); // [1, 3]
          var parent_name_last = objectMembers_indexes.length; // 2
          var parent_name_start_index =
            objectMembers_indexes[parent_name_last - 1]; //3

          var parent_name_sequence = sequence_key_position.slice(0, 3);

          function check_recursion(single_sequence, last_value) {
            var sequence_key_position_length = single_sequence.length; // 4
            while (sequence_key_position_length > 0) {
              var increment = 0;
              let element = single_sequence[increment]; // 0 objectMembers 0 name
              last_value = last_value[element]; // something
              increment += 1;
              single_sequence.shift();
              return check_recursion(single_sequence, last_value);
            }
            return last_value;
          }
          let second_nested_instence_key = check_recursion(
            parent_name_sequence,
            result.attributes
          );

          let instance_key = check_recursion(
            sequence_key_position,
            result.attributes
          );

          var nested_obj = new Object();
          nested_obj[instance_key] = sequence_value; // 애가 {volume_nested: [1,2,3]} 과 {volume_nested1: [4,5,6]}이고

          var parent_obj = new Object();
          parent_obj[second_nested_instence_key.name] = nested_obj;
          this.obj[second_nested_instence_key.name] = mergeDeep(
            nested_obj,
            this.obj[second_nested_instence_key.name]
          );
        };

        this.iter = function (user_arr, sequence_key_position, sequence_value) {
          function check_recursion(single_sequence, last_value) {
            var sequence_key_position_length = single_sequence.length; // 4
            while (sequence_key_position_length > 0) {
              var increment = 0;
              let element = single_sequence[increment]; // 0 objectMembers 0 name
              last_value = last_value[element]; // something
              increment += 1;
              single_sequence.shift();
              return check_recursion(single_sequence, last_value);
            }
            return last_value;
          }

          let instance_key = check_recursion(
            sequence_key_position,
            result.attributes
          );



          this.obj[instance_key] = sequence_value;
        };
        return this.arr.push(this.obj);
      }

      for (let k = 0; k < result.attributes.length; k++) {
        var rootAttribute = new Attribute();
        var data_model_json_attribute = result.attributes[k];

        
        await rootAttribute.fill(user_arr.slice(2*k, 2*k+2), data_model_json_attribute);
        f.push(rootAttribute.temp_arr);
      }
      


      let entities_body = new Object
      // Attributes가 한 개 일때
      if(f.length <= 1){
        entities_body = f[0][0]
      }
      // Attributes가 한 개 이상일 때 
      else{
        for(let i = 0; i < f.length; i++){
          entities_body = mergeDeep(entities_body, f[i][0])
        }
      }


      let upsert_info_obj = await model_list.findOne({where: {md_id: md_id}, attributes: ['processed_model'] }).then(
        (upsert_info) => {
          const {processed_model} = upsert_info
          let upsert_name_space =  processed_model.split(',')[0]
          let upsert_type = processed_model.split(',')[1]
          let upsert_version = processed_model.split(',')[2]
          let upsert_dataset_name = processed_model.split(',')[3]
          return {'upsert_name_space': upsert_name_space, "upsert_type":upsert_type, 'upsert_version':upsert_version,"upsert_dataset_name":upsert_dataset_name }
        }
      )

      const {upsert_name_space, upsert_type, upsert_version, upsert_dataset_name} = upsert_info_obj
      let upsert_JSON_body = new Object();
      let entities = new Array();
      upsert_JSON_body["datasetId"] =  upsert_dataset_name // "waterDataset27";
      let entities_id = new Object();
      entities_id["id"] = `urn:${upsert_dataset_name}:vredutest`;
      let entities_type = new Object();
      entities_type["type"] = `${upsert_type}.${upsert_name_space}:${upsert_version}`;
      entities.push({
        ...entities_id,
        ...entities_type,
        ...entities_body,
      });
      upsert_JSON_body["entities"] = entities;
      


      await axios({
        method: "post",
        url: "http://203.253.128.184:18127/entityOperations/upsert",
        data: upsert_JSON_body
      ,
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {

        // console.log(response.data);
        console.log(response.data)
      });
      return;
    });
  } catch (err) {
   
    console.log(err);
  }
};

module.exports = data_upsert_serving;
