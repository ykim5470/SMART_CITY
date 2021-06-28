"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("model_lists", {
			id: { allowNull: false, autoIncrement: true, type: Sequelize.INTEGER, primaryKey: true },
			md_id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
			},
			al_time: {
				type: Sequelize.STRING,
			},
			md_name: {
				type: Sequelize.STRING,
			},
			al_name_mo: {
				type: Sequelize.STRING,
			},
			run_status: {
				type: Sequelize.STRING,
			},
			encrypted_file: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn("NOW"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn("NOW"),
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("model_lists");
	},
};
