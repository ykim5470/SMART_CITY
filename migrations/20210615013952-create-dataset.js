"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("datasets", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			dataset_id: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			dataset_des: { type: Sequelize.STRING, allowNull: false },
			dataset_name: { type: Sequelize.STRING, allowNull: false },
			updatedInterval: { type: Sequelize.STRING, allowNull: false },
			categroy: { type: Sequelize.STRING, allowNull: false },
			datasetItems: { type: Sequelize.STRING, allowNull: false },
			targetRegions: { type: Sequelize.STRING, allowNull: false },
			al_id: {
				allowNull: false,
				foreignKey: true,
				type: Sequelize.INTEGER,
			}, 
			provisioningRequestedId: { type: Sequelize.STRING, allowNull: false },
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
