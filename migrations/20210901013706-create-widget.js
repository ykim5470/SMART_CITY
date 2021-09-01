'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('widgets', {
      widget_num: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      dataset_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dataset_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      load_attr: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chart_limit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_limit: {
        type: Sequelize.STRING,
      },
      chart_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      widget_delYn: {
        type: Sequelize.CHAR,
        allowNull: false,
        defaultValue: 'N'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('widgets');
  }
};