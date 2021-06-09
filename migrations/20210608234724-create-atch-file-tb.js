'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('atch_file_tbs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      atch_file_chng_name: {
        type: Sequelize.STRING
      },
      atch_data_slp: {
        type: Sequelize.STRING
      },
      atch_origin_file_name: {
        type: Sequelize.STRING
      },
      atch_file_size: {
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
    await queryInterface.dropTable('atch_file_tbs');
  }
};