// Get DOM-element for inserting json-tree

const attr_load = async (data) => {
  data = `type=WaterFlowMeter&namespace=kr.waterdna&version=1.1`;
  let datamodel_attr = await fetch(`/dashboard/attr_load/${data}`).then((res) => res.json());
  return datamodel_attr.data;
};

var wrapper = document.getElementById("wrapper");
var data = {};
var keyName = ["name", "objectMembers", "childAttributes"];
const attrList = attr_load("d");
attrList.then((data_array) => {
  for (var i = 0; i < data_array.length; i++) {
    var objKey = Object.keys(data_array[i]);
    for (var j = 0; j < objKey.length; j++) {
      if (!keyName.includes(objKey[j])) {
        delete data_array[i][objKey[j]];
      }
    }
  }
  data["attribute"] = data_array;
  treeViewTest(data);
  console.log(JSON.stringify(data));
});
function treeViewTest(data) {
  var check_arr = new Array();
  // Create node tree view
  var data_attributes = data.attribute;
  data_attributes.map((item) => {
    tree = jsonTree.create(item, wrapper);
  });
  // // Upsert key select
  const upsert_position_select = (e) => {
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
        if (checkbox.checked) {
          check_arr.push(checkbox);
        }
      }
    }
  }
}

// var check_arr = new Array();
// // Get json-data by javascript-object
// var data = {
//   "attributes": [
//       {
//           "name": "reservoirLevelPrediction",
//           "isRequired": true,
//           "valueType": "Object",
//           "objectMembers": [
//               {
//                   "name": "LevelPrediction",
//                   "valueType": "Double"
//               },
//               {
//                   "name": "predictedAt",
//                   "valueType": "Date"
//               }
//           ],
//           "attributeType": "Property",
//           "hasObservedAt": true,
//           "childAttributes": [
//               {
//                   "name": "reservoirLevelPrediction_ChildAttr",
//                   "isRequired": true,
//                   "valueType": "Double",
//                   "objectMembers": [
//                       {
//                           "name": "test",
//                           "valueType": "Integer",
//                       },
//                       {
//                           "name" : "test_obj",
//                           "valueType": "ArrayObject",
//                           "objectMembers" : [
//                             {
//                               "name" : "nested_test_obj",
//                               "valueType": "String"
//                             }
//                           ]
//                       }
//                   ],
//                   "attributeType": "Property",
//                   "hasObservedAt": true,
//                   "childAttribute": [
//                     {
//                       "name" : "nested_child_attr",
//                       "isRequired": true,
//                       "valueType": "Integer"
//                     }
//                   ]
//               }
//           ]
//       }
//   ],
// };

// // Create node tree view
// var data_attributes = data.attributes;
// data_attributes.map((item) => {
//   tree = jsonTree.create(item, wrapper);
//   tree.expand(function (node) {
//     return node.childNodes.length < 2 || node.label === "phoneNumbers";
//   });
// });

// let getSiblings = function (e) {
//   try {
//     // Collecting siblings
//     let siblings = [];
//     // if no parent, return no sibling
//     if (!e.parentNode) {
//       return siblings;
//     }
//     // First child of the parent node
//     let sibling = e.parentNode.firstChild;

//     // Collecting siblings
//     while (sibling) {
//       if (sibling.nodeType === 1 && sibling !== e) {
//         siblings.push(sibling);
//       }
//       sibling = sibling.nextSibling;
//     }
//     return siblings;
//   } catch (err) {
//     console.log(err);
//   }
// };

// // Structure upsert JSON body
// const upsert_json_body = new Object();

// // Upsert key select
// const upsert_position_select = (e) => {
//   try {
//     if (e.target.checked) {
//       check_arr.push(e.target);
//     } else {
//       check_arr = check_arr.filter((item) => e.target != item);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

// // IsRequired info
// const isRequired = (attr_name_node_child_value) => {
//   try {
//     var attr_name_node = attr_name_node_child_value.parentElement;
//     var attr_name = attr_name_node_child_value.innerText.trim();
//     var attribute_siblings = getSiblings(attr_name_node); // valueType, isRequired, attributeType, maxLength, etc
//     var checked_obj = new Object();
//     attribute_siblings.map((el, idx) => {
//       if (el.childNodes.length === 4) {
//         var attr_key = el.childNodes[1];
//         var attr_value = el.childNodes[3];
//         if (attr_key.outerText.trim() === '"isRequired" :') {
//           var required_index = attr_value.innerText.split(",")[0];
//           checked_obj[attr_name] = required_index.trim();
//           upsert_json_body[attr_name] = {};
//         }
//       } else {
//         return;
//       }
//     });
//     return checked_obj;
//   } catch (err) {
//     console.log(err);
//   }
// };

// // Create checkbox for attribute name identify
// var node_list = document.getElementsByClassName("jsontree_node");

// for (let i = 0; i < node_list.length; i++) {
//   var node_list_childNodes = node_list[i].childNodes;
//   if (node_list_childNodes.length == 4) {
//     var node_list_label = node_list_childNodes[1]; // span.jsontree_label-wrapper
//     var node_list_value = node_list_childNodes[3]; // span.jsontree_value-wrapper

//     if (node_list_label.outerText.trim() == '"name" :') {
//       var checkbox = document.createElement("input");
//       checkbox.type = "checkbox";
//       checkbox.className = node_list_value.innerText;
//       checkbox.addEventListener("change", upsert_position_select);
//       node_list_value.insertBefore(checkbox, node_list_value.childNodes[0]);
//       checkbox.checked =
//         Object.values(isRequired(node_list_value)) == "true" ? true : false;
//       checkbox.disabled =
//         Object.values(isRequired(node_list_value)) == "true" ? true : false;

//       if (checkbox.checked) {
//         check_arr.push(checkbox);
//       }
//     }
//   }
// }

// console.log(check_arr); // 나중에 다음과 같은 구조로 변환될 예정.
// /*
// 	'attributes.0.name': 'reservoirLevelPrediction',
//   'attributes.0.objectMembers.0.name': 'LevelPrediction',
//   'attributes.0.objectMembers.1.name': 'predictedAt',
//   'attributes.0.childAttributes.0.name': 'reservoirLevelPrediction_ChildAttr',
//   'attributes.0.childAttributes.0.objectMembers.0.name': 'test',
// */
