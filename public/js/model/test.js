// Get DOM-element for inserting json-tree
var wrapper = document.getElementById("wrapper");

// Get json-data by javascript-object
var data = {
    "type": "childAttribute_test_model",
    "namespace": "childAttribute",
    "version": "2.0",
    "name": "차일드 어트리뷰트 테스트",
    "context": [
        "차일드"
    ],
    "description": "차일드 어트리뷰트 테스트",
    "attributes": [
        {
            "name": "reservoirLevelPrediction",
            "isRequired": true,
            "valueType": "Object",
            "objectMembers": [
                {
                    "name": "LevelPrediction",
                    "description": "reservoirLevel prediction",
                    "valueType": "Double"
                },
                {
                    "name": "predictedAt",
                    "description": "reservoirLevelPrediction predictedAt",
                    "valueType": "Date"
                }
            ],
            "attributeType": "Property",
            "hasObservedAt": true,
            "childAttributes": [
                {
                    "name": "reservoirLevelPrediction ChildAttribute",
                    "isRequired": true,
                    "valueType": "Object",
                    "objectMembers": [
                        {
                            "name": "reservoirLevelPrediction ChildAttribute object members",
                            "valueType": "Double",
                            "objectMembers": [
                                {
                                    "name": "test",
                                    "valueType": "Object"
                                }
                            ]
                        }
                    ],
                    "attributeType": "Property",
                    "hasObservedAt": true
                }
            ]
        },
        {
            "name": "waterIndexPrediction",
            "isRequired": true,
            "valueType": "Object",
            "objectMembers": [
                {
                    "name": "index",
                    "description": "waterIndexPrediction index",
                    "valueType": "Integer",
                    "objectMembers": []
                },
                {
                    "name": "predictedAt",
                    "description": "waterIndexPrediction predictedAt",
                    "valueType": "Date"
                }
            ],
            "attributeType": "Property",
            "hasObservedAt": true
        }
    ],
    "createdAt": "2021-08-12T14:16:36,104+09:00",
    "modifiedAt": "2021-08-17T15:57:49,058+09:00"
};

// or from a string by JSON.parse(str) method
// var dataStr = '{ "firstName": "Jonh", "lastName": "Smith", "phones": ["123-45-67", "987-65-43"]}';
// try {
//     var data = JSON.parse(dataStr);
// } catch (e) {}

// Create json-tree
var tree = jsonTree.create(data, wrapper);

// Expand all (or selected) child nodes of root (optional)
tree.expand(function(node) {
   return node.childNodes.length < 2 || node.label === 'phoneNumbers';
});