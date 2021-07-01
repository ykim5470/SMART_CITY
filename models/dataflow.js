"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class dataFlow extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.dataset, { foreignKey: { name: "dataset_id", allowNull: false }, onDelete: "CASCADE" });
		}
	}
	dataFlow.init(
		{
			dataFlow_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull:false },
			dataset_id: { allowNull: false, foreignKey: true, type: DataTypes.STRING },
			target_type: { allowNull: false, type: DataTypes.STRING },
			big_data_storage: { allowNull: false, type: DataTypes.STRING },
			enabled: { allowNull: false, type: DataTypes.ENUM('true', 'false') },
			history_store_type: { allowNull: false, type: DataTypes.STRING },
		},
		{
			sequelize,
			modelName: "dataFlow",
		}
	);
	return dataFlow;
};
