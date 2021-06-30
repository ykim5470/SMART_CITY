'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class model_des extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.model_list, {
        foreignKey: { name: 'des_id', allowNull: false }, onDelete: 'CASCADE'})
    }
  };
  model_des.init({
    des_id:{ type: DataTypes.UUID, foreignKey:true, allowNull:false },
    des_text: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'model_des',
  });
  return model_des;
};