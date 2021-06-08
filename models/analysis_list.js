'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class analysis_list extends Model {
    static associate(models) {
      analysis_list.hasMany(models.column_tb);
    }
  };
  analysis_list.init({
    al_name: {
      type: DataTypes.STRING,
      allowNull: false
      },
    al_des: {type: DataTypes.TEXT}
  }, {
    sequelize,
    modelName: 'analysis_list',
  });
  return analysis_list;
};