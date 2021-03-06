"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("model_inputs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      ip_id: {
        allowNull: false,
        foreignKey: true,
        onDelete: "CASCADE",
        references: {
          model: "model_lists",
          key: "md_id",
        },
        type: Sequelize.UUID,
      },
      ip_param: {
        type: Sequelize.STRING,
      },
      ip_order: { type: Sequelize.INTEGER },
      ip_value: {
        type: Sequelize.STRING,
      },
      ip_type: {
        type: Sequelize.STRING,
      },
      ip_load: {
        type: Sequelize.INTEGER,
      },
      ip_param_type: {
        type: Sequelize.JSON,
      },
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
    await queryInterface.dropTable("model_inputs");
  },
};
