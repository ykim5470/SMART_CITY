'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class analysis_list extends Model {
    static associate(models) {
      analysis_list.hasMany(models.column_tb);
      this.hasMany(models.model_list, {foreignKey: 'md_id'})
    }
  };
  analysis_list.init({
    al_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
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