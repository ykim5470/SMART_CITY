"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class analysis_list extends Model {
    static associate(models) {
      analysis_list.hasMany(models.column_tb, {
        foreignKey: "al_id_col",
      });
      // analysis_list.hasMany(models.model_list, {
      //   foreignKey: "al_id",
      // });
      analysis_list.hasMany(models.dataset, {
        foreignKey: 'al_id'
      })
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      namespace: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING
      },
      context: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: { 
        type: DataTypes.TEXT
      },
      indexAttributeNames: {
        type: DataTypes.STRING
      },
      al_delYn: {
        type: DataTypes.CHAR,
        allowNull: false,
        defaultValue: 'N'
      }
    },
    {
      sequelize,
      modelName: "analysis_list",
    }
  );
  return analysis_list;
};
