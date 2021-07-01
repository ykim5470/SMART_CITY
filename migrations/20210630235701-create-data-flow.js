'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dataFlows', {

      dataFlow_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dataset_id: {
        allowNull: false,
				foreignKey: true,
				onDelete:'CASCADE',
				references:{
				  model: 'dataset',
				  key : 'dataset_id'
				},
				type: Sequelize.STRING
      },
      target_type: {
        type: Sequelize.STRING
      },
      big_data_storage: {
        type: Sequelize.STRING
      },
      enabled: {
        type: Sequelize.ENUM('true','false')
      },
      history_store_type: {
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
    await queryInterface.dropTable('dataFlows');
  }
};