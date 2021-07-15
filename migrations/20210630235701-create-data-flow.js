"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("dataflows", {
      df_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dataset_id: {
        allowNull: false,
        foreignKey: true,
        onDelete: "CASCADE",
        references: {
          model: "dataset",
          key: "dataset_id",
        },
        type: Sequelize.STRING,
      },
      description: { type: Sequelize.STRING },
      historyStoreType: { allowNull: false, type: Sequelize.STRING },
      enabled: { allowNull: false, type: Sequelize.ENUM("true", "false") },
      types: { allowNull: false, type: Sequelize.STRING },
      brokerStorageTypes: { type: Sequelize.STRING },
      handlerStorageTypes: { type: Sequelize.STRING },
      df_delYn :{type: Sequelize.CHAR, allowNull:false, defaultValue:'N'}
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("dataflows");
  },
};
