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
      this.hasMany(models.model_list, { foreignKey: 'dataset_id' }),
      this.hasMany(models.dataFlow, {foreignKey: 'dataset_id'})
      this.belongsTo(models.analysis_list, 
        {
          foreignKey: { name: 'al_id', allowNull: false },
          onDelete: "CASCADE"
        }
      )
    }
  };
  dataset.init({
    dataset_id:  {type :DataTypes.STRING , allowNull: false , primaryKey: true}, // PK model_list
    dataset_des: { type : DataTypes.STRING, allowNull: false }, 
    dataset_name: { type: DataTypes.STRING, allowNull: false },
    updatedInterval: { type: DataTypes.STRING, allowNull: false},
    categroy: { type: DataTypes.STRING, allowNull: false},
    datasetItems: { type: DataTypes.STRING, allowNull: false},
    targetRegions: { type: DataTypes.STRING, allowNull: false},
    al_id:  {
      allowNull: false,
      foreignKey: true,
      type: DataTypes.INTEGER
      }, // FK analysis_list
    provisioningRequestedId: {type: DataTypes.STRING, allowNull: false}
    
  }, {
    sequelize,
    modelName: 'dataset',
  });
  return dataset;
};