'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('error_logs', {
      err_num: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      col_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      col_id:{
        type:Sequelize.STRING,
        allowNull:false
      },
      operation:{type:Sequelize.STRING,allowNull:false},
      err_code:{type:Sequelize.STRING,allowNull:false},
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
    await queryInterface.dropTable('error_logs');
  }
};