"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class chart_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.chart_entities, { foreignKey: "chart_id" });
    }
  }
  chart_list.init(
    {
      chart_list_id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "chart_list",
    }
  );
  return chart_list;
};
