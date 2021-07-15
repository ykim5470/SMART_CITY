"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class dataflow extends Model {
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
	dataflow.init(
		{
			df_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull:false },
			dataset_id: { allowNull: false, foreignKey: true, type: DataTypes.STRING },
			description : { type: DataTypes.STRING },
			historyStoreType: { allowNull: false, type: DataTypes.STRING },
			enabled: { allowNull: false, type: DataTypes.ENUM('true', 'false') },
			types: { allowNull: false, type: DataTypes.STRING },
			brokerStorageTypes: { type: DataTypes.STRING },
			handlerStorageTypes: { type: DataTypes.STRING },
			df_delYn : {type:DataTypes.CHAR ,allowNull:false, defaultValue:'N'}
		},
		{
			sequelize,
			modelName: "dataflow",
		}
	);
	return dataflow;
};
