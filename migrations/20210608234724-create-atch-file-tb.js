"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("atch_file_tbs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			file_id: {
				allowNull: false,
				foreignKey: true,
				onDelete: "CASCADE",
				references: {
					model: "model_lists",
					key: "md_id",
				},
				type: Sequelize.UUID,
			},
			originalname: Sequelize.STRING,
			mimetype: Sequelize.STRING,
			path: Sequelize.STRING,
			filename:{ type: Sequelize.STRING, allowNull: false },
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
		await queryInterface.dropTable("atch_file_tbs");
		// return queryInterface.removeColumn("atch_file_chng_name", "atch_data_slp", "atch_origin_file_name", "atch_file_size");
	},
};
