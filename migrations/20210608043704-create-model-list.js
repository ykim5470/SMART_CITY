'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('model_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      md_id: {
        type: Sequelize.STRING
      },
      al_time: {
        type: Sequelize.STRING
      },
      md_name: {
        type: Sequelize.STRING
      },
      al_name_mo: {
        type: Sequelize.STRING
      },
      run_status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('model_lists');
  }
};