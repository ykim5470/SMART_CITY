'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class error_log extends Model {
    static associate(models) {
    }
  };
  error_log.init({
    err_num: { allowNull : false, autoIncrement:true, primaryKey:true,type:DataTypes.INTEGER },
    err_code:{type:DataTypes.INTEGER, allowNull:false},
    err_desc: {type:DataTypes.STRING, allowNull:false},
    err_model: {type:DataTypes.STRING, allowNull:false}
  }, {
    sequelize,
    modelName: 'error_log',
  });
  return error_log;
};