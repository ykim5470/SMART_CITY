'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('column_tbs', {
      col_id:{
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      al_id_col: {
        allowNull: false,
        foreignKey: true,
        onDelete:'CASCADE',
        references:{
          model: 'analysis_list',
          key : 'al_id'
        },
        type: Sequelize.INTEGER
      },
      data_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_size: {
        type: Sequelize.STRING
      },
      column_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      allowNull: {
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