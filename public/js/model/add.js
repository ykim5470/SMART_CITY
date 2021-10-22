// Client socket instance create
const socket = io();

/* 
    DOM
  - 분석 시간 input
	- 데이터 선택 input
	- 분석 모델 선택 input
	- 인풋 파라미터 유저 input
	- 파일 선택 input
	- 아웃풋 파라미터 
	- 등록 완료
 */
const al_time_input = document.querySelector("#al_time");
const data_select_input = document.querySelector("#data_select");
const analysis_select_input = document.querySelector("#al_select");
const file_select_input = document.querySelector("#file_select");
const input_params_insert = document.querySelector(".input_params_insert");
const user_output_param = document.querySelector(".user_output_param");
const output_look_up_insert = document.querySelector(".output_look_up_insert");
const register_complete = document.querySelector("#submitBtn");
const model_description = document.querySelector(".md_desc");
const sub_data_insert = document.querySelector(".sub_data_insert");
const sub_data_insert_option = document.querySelector(
  ".sub_data_insert_option"
);

const user_input_value = new Array();

window.addEventListener("load", (e) => {
  if (data_select_input.value != "") {
    socket.emit("데이터 선택", {
      dataset_info: data_select_input.value,
    });
    socket.emit("분석 모델 선택", {
      model_type: analysis_select_input.value.split(",")[0],
      model_namespace: analysis_select_input.value.split(",")[1],
      model_version: analysis_select_input.value.split(",")[2],
      selected_processed_dataset_id: analysis_select_input.value.split(",")[3],
    });
  }
});
// 원천 데이터 선택 값 전송
data_select_input.addEventListener("change", (e) => {
  e.preventDefault();
  if (data_select_input.value == undefined) {
    return;
  }
  socket.emit("데이터 선택", {
    dataset_info: data_select_input.value,
  });
});

// 가공 데이터 셋 선택
analysis_select_input.addEventListener("change", (e) => {
  e.preventDefault();
  if (analysis_select_input.value == undefined) {
    return;
  }
  socket.emit("분석 모델 선택", {
    model_type: analysis_select_input.value.split(",")[0],
    model_namespace: analysis_select_input.value.split(",")[1],
    model_version: analysis_select_input.value.split(",")[2],
    selected_processed_dataset_id: analysis_select_input.value.split(",")[3],
  });
});

/* Event listen */
// input params GET & add to page
socket.on("데이터 선택 완료 및 인풋 calling", (attr) => {
  const data_model = attr;
  const input_box = data_model.map((items, index) => {
    return `
        <tr>
            <td><input name="ip_attr_value_type" value="${items.valueType}" readonly /></td>
            <td><input class='ip_attr_name' name="ip_attr_name" value="${items.name}" readonly /></td>
            <td><input type="number" name="user_input_order"/></td> 
            <td><input type="text" class="user_input_param" name="user_input_param"/></td>
            <td id='max_data_load_box${index}'></td>
            <td id='param_tf_shape${index}'></td>
        </tr>
        `;
  });
  input_params_insert.innerHTML = input_box.join("");

  // 데이터 선택 후 유저 입력 여부 확인 및 테이블 데이터 INSERT
  const user_input_param = document.getElementsByClassName("user_input_param");
  const input_arr = Array.from(user_input_param);

  input_arr.map((el, index) => {
    el.addEventListener("change", (e) => {
      let max_data_load_box = document.querySelector(
        `#max_data_load_box${index}`
      );
      let param_tf_shape_box = document.querySelector(
        `#param_tf_shape${index}`
      );
      if (e.target.value !== "") {
        max_data_load_box.innerHTML = `
        <input name='max_data_load_index' value=${index} hidden/>
        <input class='max_data_load_limit' type='number' name='max_data_load' placeholder="i.e. 5 10 48 etc"/>
        `;
        param_tf_shape_box.innerHTML = `
        <input name='tf_shape_index' value=${index} hidden/>
        <input name='tf_shape' class='tf_shape' placeholder='i.e. [40] [[1,2,3],[4,5,6]]'/>`;
      } else {
        max_data_load_box.innerHTML = "";
        param_tf_shape_box.innerHTML = "";
      }
    });
  });
});

// sub_data GET & add to page
socket.on("데이터 선택 완료 및 개별 센서 데이터 calling", (data) => {
  const sub_data = data;
  const sub_box = sub_data.map((items, index) => {
    return `
		<tr>
			<td>
				<input type='checkbox' class='sub_data_select' name='sub_data_select' value=${items.id}/>
			</td>
			<td>${items.name.value}</td>
		<tr>
		`;
  });
  sub_data_insert.innerHTML = sub_box.join("");
  let temp_sub_data_list = new Array();
  sub_data_insert.addEventListener("click", (e) => {
    if (temp_sub_data_list.includes(e.target.value)) {
      temp_sub_data_list = temp_sub_data_list.filter((el) => {
        return el !== e.target.value;
      });
    } else {
      temp_sub_data_list.push(e.target.value);
    }
    let sub_data_list = temp_sub_data_list.filter((item) => {
      return item !== undefined;
    });
    if (sub_data_list.length >= 2) {
      let sub_option_box = `
			<td>
				<label for="data_processing">옵션 선택: </label>
				<select name="data_processing">
					<option value="">선택</option>
					<option value="add">합</option>
					<option value="average">평균</option>
				</select>
			</td>
			`;
      sub_data_insert_option.innerHTML = sub_option_box;
    } else {
      let sub_option_box_delete = `<tr></tr>`;
      sub_data_insert_option.innerHTML = sub_option_box_delete;
    }
  });
});

// Output model JSON GET & Create JSON tree view
socket.on("분석 모델 선택 완료 및 JSON calling", async (data) => {

  const output_look_up_data = `<table>
  <tbody>
    <tr>
      <td>
        <div class="item-input item-input-flex">
          <input
            class="op_data_lookup"
            type="number"
            name="op_data_lookup_date"
            placeholder="일"
          />
          <input
            class="op_data_lookup"
            type="number"
            name="op_data_lookup_hour"
            placeholder="시간"
          />
          <input
            class="op_data_lookup"
            type="number"
            name="op_data_lookup_min"
            placeholder="분"
          />
          <input
            class="op_data_lookup"
            type="number"
            name="op_data_lookup_sec"
            placeholder="초"
          />
        </td>
      </tr>
    </tbody>
  </table>`;
  output_look_up_insert.innerHTML = output_look_up_data;
  // op_sequence array
  const temp_op_sequence = new Array();

  // Get DOM-element for inserting json-tree
  var wrapper = document.getElementById("wrapper");

  var check_arr = new Array();

  $(document).ready(function () {
    $(".jsontree_label-wrapper:contains('childAttributes')").addClass(
      "in_child"
    );
    $(".jsontree_label-wrapper:contains('objectMembers')").addClass("in_obj");
    $(".in_child").each(function (index) {
      $(this).children(".jsontree_label").append('<p class="none">"0"</p>');
    });
    $(".in_obj").each(function (index) {
      $(this).children(".jsontree_label").append('<p class="none"></p>');
    });
    $(".jsontree_tree").each(function (index) {
      $(this).append('<p class="none">' + index + "</p>");
    });
    // $(".jsontree_child-nodes").children(".jsontree_node_complex").siblings(".jsontree_node").find("input").attr("disabled", true);
  });

  // Get json-data by javascript-object

  var data = data;

  // Create node tree view
  var data_attributes = data.attributes;
  data_attributes.map((item) => {
    tree = jsonTree.create(item, wrapper);
    tree.expand(function (node) {
      return node.childNodes.length < 2 || node.label === "phoneNumbers";
    });
  });

  let getSiblings = function (e) {
    try {
      // Collecting siblings
      let siblings = [];
      // if no parent, return no sibling
      if (!e.parentNode) {
        return siblings;
      }
      // First child of the parent node
      let sibling = e.parentNode.firstChild;

      // Collecting siblings
      while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
          siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
      }
      return siblings;
    } catch (err) {
      console.log(err);
    }
  };

  // Structure upsert JSON body
  const upsert_json_body = new Object();

  // Upsert key select
  const upsert_position_select = (e) => {
    if (e.target.checked == true) {
      $(".over").removeClass("over");
      $(e.target)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent(".jsontree_node_complex")
        .addClass("over");
      var over = $(".over")
        .children(".jsontree_label-wrapper")
        .children(".jsontree_label")
        .text();
      $(".over")
        .parent()
        .parent()
        .parent()
        .siblings(".in_obj")
        .children(".jsontree_label")
        .children("p")
        .text(over + ",");
      $(e.target)
        .parents("li.jsontree_node_complex")
        .children(".jsontree_label-wrapper")
        .children('span.jsontree_label:contains("objectMembers")')
        .find("p")
        .text();
      $(e.target)
        .parents("li.jsontree_node_complex")
        .children(".jsontree_label-wrapper")
        .children('span.jsontree_label:contains("childAttributes")')
        .find("p")
        .text();
      var var01 = $(e.target)
        .parents("li.jsontree_node_complex")
        .children(".jsontree_label-wrapper")
        .children('span.jsontree_label:contains("childAttributes")')
        .text();
      var var02 = $(e.target)
        .parents("li.jsontree_node_complex")
        .children(".jsontree_label-wrapper")
        .children('span.jsontree_label:contains("objectMembers")')
        .text();
      var var03 = $(e.target).parents(".jsontree_tree").children("p").text();
      var strArray01 = var02.split(",").reverse();
      var arr01 = new Array(strArray01);
      var test01 = arr01;

      // User click
      temp_op_sequence.push(
        // '"attributes"' + '"' + var03 + '"' + var01 + test01 + "name"
        '"' + var03 + '"' + var01 + test01 + "name"

      );
      if (temp_op_sequence.length >= 1) {
        let op_sequence = temp_op_sequence.map((el) => {
          const op_processing = (op) => {
            let removed_comma = op.replaceAll(",", "");
            let add_double_quote = removed_comma.replaceAll("name", '"name"');
            let temp_split = add_double_quote.split('"');
            let temp_list = temp_split.filter((el) => {
              if (el != "") {
                return el;
              }
            });
            return temp_list.join(".");
          };
          return op_processing(el);
        });
        user_output_param.value = op_sequence
      } else {
        throw "결과 값을 넣을 속성을 모두 선택해 주세요.";
      }
      return;
    }
    try {
      if (e.target.checked) {
        check_arr.push(e.target);
      } else {
        check_arr = check_arr.filter((item) => e.target != item);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // IsRequired info
  const isRequired = (attr_name_node_child_value) => {
    try {
      var attr_name_node = attr_name_node_child_value.parentElement;
      var attr_name = attr_name_node_child_value.innerText.trim();
      var attribute_siblings = getSiblings(attr_name_node); // valueType, isRequired, attributeType, maxLength, etc
      var checked_obj = new Object();
      attribute_siblings.map((el, idx) => {
        if (el.childNodes.length === 4) {
          var attr_key = el.childNodes[1];
          var attr_value = el.childNodes[3];
          if (attr_key.outerText.trim() === '"isRequired" :') {
            var required_index = attr_value.innerText.split(",")[0];
            checked_obj[attr_name] = required_index.trim();
            upsert_json_body[attr_name] = {};
          }
        } else {
          return;
        }
      });
      return checked_obj;
    } catch (err) {
      console.log(err);
    }
  };

  // Create checkbox for attribute name identify
  var node_list = document.getElementsByClassName("jsontree_node");

  for (let i = 0; i < node_list.length; i++) {
    var node_list_childNodes = node_list[i].childNodes;
    if (node_list_childNodes.length == 4) {
      var node_list_label = node_list_childNodes[1]; // span.jsontree_label-wrapper
      var node_list_value = node_list_childNodes[3]; // span.jsontree_value-wrapper

      if (node_list_label.outerText.trim() == '"name" :') {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = node_list_value.innerText;
        checkbox.addEventListener("change", upsert_position_select);
        node_list_value.insertBefore(checkbox, node_list_value.childNodes[0]);
        checkbox.checked =
          Object.values(isRequired(node_list_value)) == "true" ? true : false;
        checkbox.disabled =
          Object.values(isRequired(node_list_value)) == "true" ? true : false;

        if (checkbox.checked) {
          check_arr.push(checkbox);
          var var01 = $(checkbox)
            .parents("li.jsontree_node_complex")
            .children(".jsontree_label-wrapper")
            .children('span.jsontree_label:contains("childAttributes")')
            .text();
          var var02 = $(checkbox)
            .parents("li.jsontree_node_complex")
            .children(".jsontree_label-wrapper")
            .children('span.jsontree_label:contains("objectMembers")')
            .text();
        }
      }
    }
  }
});


const register_submit = () => {
  register_complete.addEventListener("click", async (e) => {
    // 파일 정보 post
    return await document.querySelector("#register_complete").submit();
  });
};

register_submit();
