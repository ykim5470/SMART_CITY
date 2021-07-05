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
    ds_id: {type :DataTypes.INTEGER , allowNull: false, autoIncrement:true, unique:true},
    dataset_id:  {type :DataTypes.STRING , allowNull: false , primaryKey: true}, // PK model_list
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type : DataTypes.STRING}, 
    updateInterval: { type: DataTypes.STRING, allowNull: false},
    category: { type: DataTypes.STRING, allowNull: false},
    providerOrganization: { type: DataTypes.STRING, allowNull: false},
    providerSystem: { type: DataTypes.STRING, allowNull: false},
    isProcessed: { type: DataTypes.STRING, allowNull: false, defaultValue: "가공데이터"},
    ownership: { type: DataTypes.STRING, allowNull: false},
    keywords: { type: DataTypes.STRING},
    license: { type: DataTypes.STRING, allowNull: false},
    providingApiUri: { type: DataTypes.STRING},
    restrictions: { type: DataTypes.STRING},
    datasetExtension: { type: DataTypes.STRING},
    datasetItems: { type: DataTypes.STRING,allowNull: false},
    targetRegions: { type: DataTypes.STRING,allowNull: false},
    sourceDatasetIds: { type: DataTypes.STRING},
    qualityCheckEnabled: { type: DataTypes.STRING, allowNull: false},
    dataIdentifierType: { type: DataTypes.STRING},
    al_id:  {
      allowNull: false,
      foreignKey: true,
      type: DataTypes.INTEGER
      }, // FK analysis_list
    datamodelType: { type: DataTypes.STRING, allowNull: false},
    datamodelNamespace: { type: DataTypes.STRING, allowNull: false},
    datamodelVersion: { type: DataTypes.STRING, allowNull: false},
    storageRetention: { type: DataTypes.STRING},
    topicRetention: { type: DataTypes.STRING}
  }, {
    sequelize,
    modelName: 'dataset',
  });
  return dataset;
};