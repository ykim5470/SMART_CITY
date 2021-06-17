'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analysis_lists', {
      al_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      al_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      al_ns: {
        type: Sequelize.STRING,
        allowNull: false
      },
      al_version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      al_context: {
        type: Sequelize.STRING,
        allowNull: false
      },
      al_delYn: {
        type: Sequelize.CHAR,
        allowNull: false,
        defaultValue:'N'
      },
      al_des: {
        type: Sequelize.TEXT,
        allowNull: false
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
    await queryInterface.dropTable('analysis_lists');
  }
};