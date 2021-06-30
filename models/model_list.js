"use strict";
const { Model, UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class model_list extends Model {
		static associate(models) {
			// define association here
			this.hasMany(models.model_input, { foreignKey: "ip_id" });
			this.hasMany(models.model_output, {foreignKey: 'op_id'})
			this.hasMany(models.atch_file_tb, { foreignKey: "file_id" });
			this.hasMany(models.model_des, { foreignKey: "des_id" });
			this.belongsTo(models.analysis_list, {
				foreignKey: {name:'al_id', allowNull:false},
				onDelete:"CASCADE"
			})
		}
	}
	model_list.init(
		{
			md_id: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4, primaryKey: true },
			al_time: { type: DataTypes.INTEGER, allowNull: false },
			md_name: {
				type: DataTypes.STRING,
				defaultValue: "test",
				allowNull: true,
			},
			al_name_mo: { type: DataTypes.STRING, defaultValue: "no Model selected", allowNull: true },
			run_status: { type: DataTypes.ENUM("running", "stop"), defaultValue: "running", allowNull: true },
			encrypted_file: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "encrypted",
			},
			data_model_name: { type: DataTypes.STRING, allowNull: false },
			al_id:  {
				allowNull: false,
				foreignKey: true,
				type: DataTypes.INTEGER
			  },
		},


		{
			sequelize,
			modelName: "model_list",
		}
	);
	return model_list;
};
