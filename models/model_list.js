'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class model_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  model_list.init({
    md_id: DataTypes.STRING,
    al_time: DataTypes.STRING,
    md_name: DataTypes.STRING,
    al_name_mo: DataTypes.STRING,
    run_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'model_list',
  });
  return model_list;
};