// Get DOM-element for inserting json-tree
var wrapper = document.getElementById("wrapper");

var check_arr = new Array();

$(document).ready(function(){
  $(".jsontree_label-wrapper:contains('childAttributes')").addClass("in_child")
  $(".jsontree_label-wrapper:contains('objectMembers')").addClass("in_obj")
  $(".in_child").each(function(index) {$(this).children(".jsontree_label").append('<p class="none">"0"</p>')})
  $(".in_obj").each(function(index) {$(this).children(".jsontree_label").append('<p class="none"></p>')})

  // $(".jsontree_child-nodes").children(".jsontree_node_complex").siblings(".jsontree_node").find("input").attr("disabled", true);
})

// Get json-data by javascript-object
var data ={
  "type": "TransmissivityPrediction",
  "namespace": "kr.waterdna",
  "version": "1.5",
  "name": "LID 투수량 예측",
  "context": [
      "http://uri.etsi.org/ngsi-ld/core-context.jsonld"
  ],
  "description": "LID 투수량 예측",
  "attributes": [
      {
          "name": "TrPredicted",
          "isRequired": true,
          "valueType": "Object",
          "objectMembers": [
              {
                  "name": "predictedAt",
                  "valueType": "ArrayString"
              },
              {
                  "name": "volume",
                  "valueType": "ArrayDouble"
              }
          ],
          "attributeType": "Property",
          "hasObservedAt": true
      },
      {
          "name": "TrChild",
          "isRequired": true,
          "valueType": "Object",
          "objectMembers": [
              {
                  "name": "predictedAt",
                  "valueType": "ArrayString"
              },
              {
                  "name": "childVolume",
                  "valueType": "ArrayDouble"
              }
          ],
          "attributeType": "Property",
          "hasObservedAt": true
      }
  ],
  "createdAt": "2021-10-07T15:25:11,121+09:00",
  "modifiedAt": "2021-10-07T15:25:11,121+09:00"
}

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

  if(e.target.checked == true){

    $(".over").removeClass("over")
    $(e.target).parent().parent().parent().parent().parent().parent(".jsontree_node_complex").addClass("over");
    var over = $(".over").children(".jsontree_label-wrapper").children(".jsontree_label").text()
    $(".over").parent().parent().parent().siblings(".in_obj").children(".jsontree_label").children("p").text(over + ",");

    // console.log(over)
    // var var03 = $(e.target).parent().parent().parent().parent().parent().siblings(".jsontree_label-wrapper").children(".jsontree_label").text()
    // var var03 = $(e.target).parents(".jsontree_node_complex").children(".jsontree_label-wrapper").find(".jsontree_label").text()

    // console.log(var03)

    $(e.target).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("objectMembers")').find("p").text();
    $(e.target).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("childAttributes")').find("p").text();
    

    var var01 = $(e.target).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("childAttributes")').text();
    var var02 = $(e.target).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("objectMembers")').text();
    // var var03 = $(e.target).parent().parent().parent().parent().parent().siblings(".jsontree_label-wrapper").children(".jsontree_label").text()

    var strArray01 = var02.split(",").reverse();
    // var strArray02 = var02.split(',').reverse();

    var arr01 = new Array(strArray01)
    // var arr02 = new Array(strArray02)

    var test01 = arr01
    // var test02 = arr02

    console.log(var01 + test01 + ", name")
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
        var var01 = $(checkbox).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("childAttributes")').text();
        var var02 = $(checkbox).parents("li.jsontree_node_complex").children(".jsontree_label-wrapper").children('span.jsontree_label:contains("objectMembers")').text();
        console.log(var01 + var02)
      }
    }
  }
}

console.log(check_arr) // 나중에 다음과 같은 구조로 변환될 예정. 
/*
	'attributes.0.name': 'reservoirLevelPrediction',
  'attributes.0.objectMembers.0.name': 'LevelPrediction',
  'attributes.0.objectMembers.1.name': 'predictedAt',
  'attributes.0.childAttributes.0.name': 'reservoirLevelPrediction_ChildAttr',
  'attributes.0.childAttributes.0.objectMembers.0.name': 'test',
*/

