"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class column_tb extends Model {
    static associate(models) {
      column_tb.belongsTo(models.analysis_list, {
        foreignKey: {name:'al_id_col', allowNull:false},
        onDelete:"CASCADE"
      });
    }
  }
  column_tb.init(
    { 
      col_id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      al_id_col: {
        allowNull: false,
        foreignKey: true,
        type: DataTypes.INTEGER
      },
      column_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valueType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      maxLength: {
        type: DataTypes.INTEGER,
      },
      isRequired: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attributeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "column_tb",
    }
  );
  return column_tb;
};
