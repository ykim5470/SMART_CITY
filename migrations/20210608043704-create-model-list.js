"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		(Sequelize.DATE.prototype._stringify = function (date, options) {
			date = this._applyTimezone(date, options);
			return date.format("YYYY.MM.DD - hh:mm A");
		}.bind(Sequelize.DATE.prototype)),
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
