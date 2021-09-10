"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class widget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  widget.init(
    {
      widget_num: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      dataset_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dataset_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      load_attr: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chart_limit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_limit: {
        type: DataTypes.STRING,
      },
      chart_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      widget_delYn: {
        type: DataTypes.CHAR,
        allowNull: false,
        defaultValue: 'N'
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user01'
      }
    },
    {
      sequelize,
      modelName: "widget",
    }
  );
  return widget;
};
