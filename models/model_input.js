"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class model_input extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasOne(models.dataset, {
				foreignKey: 'ip_id'
			})
		}
	}
	model_input.init(
		{
			ip_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			ip_param: { type: DataTypes.INTEGER, allowNull: true },
			ip_value: { type: DataTypes.STRING, allowNull: true },
		},
		{
			sequelize,
			modelName: "model_input",
		}
	);
	return model_input;
};
