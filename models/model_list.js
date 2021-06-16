"use strict";
const { Model, UUIDV4 } = require("sequelize");
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
		{	id: {allowNull: false, type: DataTypes.INTEGER, autoIncrement: true},
			md_id: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4, primaryKey: true, foreignKey: true },
			al_time: { type: DataTypes.INTEGER, allowNull: true },
			md_name: {
				type: DataTypes.STRING,
				defaultValue: "test",
				allowNull: true,
			},
			al_name_mo: { type: DataTypes.STRING, defaultValue: "no Model selected", allowNull: true },
			run_status: { type: DataTypes.ENUM("running", "stop"), defaultValue: "실행중", allowNull: true },
		},
		{
			sequelize,
			modelName: "model_list",
		}
	);
	return model_list;
};
