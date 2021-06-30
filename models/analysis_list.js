"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class analysis_list extends Model {
    static associate(models) {
      analysis_list.hasMany(models.column_tb, {
        foreignKey: "al_id_col",
      });
      // analysis_list.hasOne(models.model_list, {
      //   foreignKey: "al_id_model",
      // });
    }
  }
  analysis_list.init(
    {
      al_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      al_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      al_ns: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      al_version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      al_context: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      al_delYn: {
        type: DataTypes.CHAR,
        allowNull: false,
        defaultValue: 'N'
      },
      al_des: { 
        type: DataTypes.TEXT, 
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "analysis_list",
    }
  );
  return analysis_list;
};
