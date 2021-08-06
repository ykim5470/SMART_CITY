'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('object_members', {
      obj_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      col_id_obj: {
        allowNull: false,
        foreignKey: true,
        onDelete:'CASCADE',
        references:{
          model: 'column_tb',
          key : 'col_id'
        },
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valueType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      valueEnum: {
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
    await queryInterface.dropTable('object_members');
  }
};