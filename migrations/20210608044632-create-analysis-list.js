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
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      namespace: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name : {
        type : Sequelize.STRING
      },
      context: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      indexAttributeNames:{
        type:Sequelize.STRING
      },
      al_delYn: {
        type: Sequelize.CHAR,
        allowNull: false,
        defaultValue:'N'
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