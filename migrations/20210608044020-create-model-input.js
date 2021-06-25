"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("model_inputs", {
			id: {
				allowNull: false,
				foreignKey: true,
				type: Sequelize.INTEGER,
			},
			ip_id: {
				type: Sequelize.STRING,
			},
			ip_param: {
				type: Sequelize.STRING,
			},
			ip_value: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable("model_inputs");
	},
};
