"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class chart_entities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.chart_list, {
        foreignKey: { name: "chart_id", allowNull: false },
        onDelete: "CASCADE",
      });
    }
  }
  chart_entities.init(
    {
      chart_id: {
        allowNull: false,
        foreignKey: true,
        type: DataTypes.INTEGER,
      },
      chart_type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      chart_data_subscription: { allowNull: false, type: DataTypes.STRING },
      chart_name: { allowNull: false, type: DataTypes.STRING },
      chart_data_load_time: { allowNull: false, type: DataTypes.STRING },
      chart_data_type: { allowNull: false, type: DataTypes.STRING },
      chart_data_load: { allowNull: false, type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "chart_entities",
    }
  );
  return chart_entities;
};
