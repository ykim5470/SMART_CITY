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
			encrypted_file: { type: Sequelize.STRING, allowNull: false },
			data_model_name: { type: Sequelize.STRING, allowNull: false },
			al_id_model:  {
				allowNull: false,
				type: Sequelize.INTEGER
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
		await queryInterface.dropTable("model_lists");
	},
};
