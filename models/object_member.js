"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class object_member extends Model {
    static associate(models) {
      object_member.belongsTo(models.column_tb, {
        foreignKey: { name: "col_id_obj", allowNull: false },
        onDelete: "CASCADE",
      });
    }
  }
  object_member.init(
    {
      obj_id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      col_id_obj: {
        allowNull: false,
        foreignKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valueType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valueEnum: {
        type: DataTypes.STRING
      },
    },
    {
      sequelize,
      modelName: "object_member",
    }
  );
  return object_member;
};
