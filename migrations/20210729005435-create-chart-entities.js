"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("chart_entities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chart_id: {
        allowNull: false,
        foreignKey: true,
        onDelete: "CASCADE",
        type: Sequelize.INTEGER,
      },
      chart_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      chart_data_subscription: { allowNull: false, type: Sequelize.STRING },
      chart_name: { allowNull: false, type: Sequelize.STRING },
      chart_data_load_time: { allowNull: false, type: Sequelize.STRING },
      chart_data_type: { allowNull: false, type: Sequelize.STRING },
      chart_data_load: { allowNull: false, type: Sequelize.STRING },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("chart_entities");
  },
};
