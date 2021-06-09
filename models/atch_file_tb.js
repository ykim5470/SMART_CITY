'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class atch_file_tb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  atch_file_tb.init({
    atch_file_chng_name: DataTypes.STRING,
    atch_data_slp: DataTypes.STRING,
    atch_origin_file_name: DataTypes.STRING,
    atch_file_size: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'atch_file_tb',
  });
  return atch_file_tb;
};