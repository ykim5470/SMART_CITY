"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class model_output extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	model_output.init(
		{
			op_id: { type: DataTypes.INT, allowNull: false, foreginkey: true},
			op_param: { type: DataTypes.STRING, allowNull: false },
			op_value: { type: DataTypes.STRING, allowNull: true },
		},
		{
			sequelize,
			modelName: "model_output",
		}
	);
	return model_output;
};
