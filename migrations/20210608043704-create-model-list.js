"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("model_lists", {
			md_id: {
				allowNull: false,
				type: Sequelize.UUID,
				primaryKey: true,
			},
			al_time: {
				type: Sequelize.INTEGER,
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
			file_id: {
				foreignKey: true,
				onDelete: "CASCADE",
				references: {
					model: "atch_file_tbs",
					key: "file_id",
				},
				type: Sequelize.INTEGER,
			},
			data_model_name: { type: Sequelize.STRING, allowNull: false },
			al_id: {
				allowNull: false,
				foreignKey: true,
				onDelete: "CASCADE",
				references: {
					model: "analysis_lists",
					key: "al_id",
				},
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
			sub_data: {
				allowNull: false,
				type: Sequelize.JSON
			},
			data_look_up: { allowNull: false, type: Sequelize.JSON },
			max_data_load: { allowNull: false, type: Sequelize.INTEGER },
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
		await queryInterface.dropTable("model_lists");
	},
};
