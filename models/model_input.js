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
			this.belongsTo(models.model_list, {
				foreignKey: "ip_id",
				onDelete: 'CASCADE'
			});
		}
	}
	model_input.init(
		{
			id: { allowNull: false, autoIncrement: true, type: DataTypes.INTEGER, primaryKey: true },
			ip_id: { type: DataTypes.UUID, foreignKey: true, allowNull: false },
			ip_param: { type: DataTypes.STRING, allowNull: true },
			ip_value: { type: DataTypes.STRING, allowNull: true },
			ip_type:{ type: DataTypes.STRING, allowNull: true },
		},
		{
			sequelize,
			modelName: "model_input",
		}
	);
	return model_input;
};
