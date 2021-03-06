"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class atch_file_tb extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasOne(models.model_list, {foreignKey: { name: 'file_id' }, onDelete: 'CASCADE'});
		}
	}
	atch_file_tb.init(
		{
			file_id :{ type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
			originalname: { type: DataTypes.STRING, allowNull: false },
			mimetype: { type: DataTypes.STRING, allowNull: false },
			path: { type: DataTypes.STRING, allowNull: false },
			filename: { type: DataTypes.STRING, allowNull: false, foreignKey: true },
		},
		{
			sequelize,
			modelName: "atch_file_tb",
		}
	);
	return atch_file_tb;
};
