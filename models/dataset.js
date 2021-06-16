'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dataset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.model_input, { foreignKey : 'ip_id' })
    }
  };
  dataset.init({
    datset_id:  {type :DataTypes.INTEGER , allowNull: false },
    dataset_type: { type : DataTypes.STRING, allowNull: false },
    dataset_name: { type : DataTypes.STRING, allowNull: false },
    ip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'dataset',
  });
  return dataset;
};