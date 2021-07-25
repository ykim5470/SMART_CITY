'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('column_tbs', {
      col_id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      al_id_col: {
        allowNull: false,
        foreignKey: true,
        onDelete:'CASCADE',
        references:{
          model: 'analysis_lists',
          key : 'al_id'
        },
        type: Sequelize.INTEGER
      },
      column_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valueType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      maxLength: {
        type: Sequelize.STRING
      },
      minLength: {
        type: Sequelize.STRING
      },
      isRequired: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attributeType: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('column_tbs');
  }
};