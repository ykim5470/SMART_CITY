'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class model_input extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  model_input.init({
    ip_id: DataTypes.STRING,
    ip_param: DataTypes.STRING,
    ip_value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'model_input',
  });
  return model_input;
};