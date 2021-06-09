"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class model_list extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	model_list.init(
		{
			md_id: { type: DataTypes.INTEGER, allowNull: false ,autoIncrement: true, primaryKey:true},
			al_time: { type: DataTypes.INTEGER, allowNull: false },
			md_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			al_name_mo: { type: DataTypes.STRING, allowNull: true },
			run_status: { type: DataTypes.ENUM("running", "stop"), defaultValue: "running", allowNull: false },
		},
		{
			sequelize,
			modelName: "model_list",
		}
	);
	return model_list;
};
