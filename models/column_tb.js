"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class column_tb extends Model {
    static associate(models) {
      column_tb.belongsTo(models.analysis_list, {
        foreignKey: "al_id_col",
      });
    }
  }
  column_tb.init(
    {
      al_id_col: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        foreignKey: true,
        type: DataTypes.INTEGER
      },
      data_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_size: {
        type: DataTypes.INTEGER,
      },
      column_name: {
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
