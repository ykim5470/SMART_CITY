"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("datasets", {
      ds_id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique:true
      },
      dataset_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING },
      updateInterval: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      providerOrganization: { type: Sequelize.STRING, allowNull: false },
      providerSystem: { type: Sequelize.STRING, allowNull: false },
      isProcessed: { type: Sequelize.STRING, allowNull: false, defaultValue: "가공데이터" },
      ownership: { type: Sequelize.STRING, allowNull: false },
      keywords: { type: Sequelize.STRING },
      license: { type: Sequelize.STRING, allowNull: false },
      providingApiUri: { type: Sequelize.STRING },
      restrictions: { type: Sequelize.STRING },
      datasetExtension: { type: Sequelize.STRING },
      datasetItems: { type: Sequelize.STRING, allowNull: false },
      targetRegions: { type: Sequelize.STRING, allowNull: false },
      sourceDatasetIds: { type: Sequelize.STRING },
      qualityCheckEnabled: { type: Sequelize.STRING, allowNull: false },
      dataIdentifierType: { type: Sequelize.STRING },
      al_id: {
        allowNull: false,
        foreignKey: true,
        type: Sequelize.INTEGER,
      }, // FK analysis_list
      datamodelType: { type: Sequelize.STRING, allowNull: false },
      datamodelNamespace: { type: Sequelize.STRING, allowNull: false },
      datamodelVersion: { type: Sequelize.STRING, allowNull: false },
      storageRetention: { type: Sequelize.STRING },
      topicRetention: { type: Sequelize.STRING },
      ds_delYn: {
        type: Sequelize.CHAR,
        allowNull: false,
        defaultValue:'N'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("datasets");
  },
};
