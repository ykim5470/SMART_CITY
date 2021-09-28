"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  auth.init(
    {
      type: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.STRING, allowNull: false },
      nickname: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      iat: { type: DataTypes.INTEGER, allowNull: false },
      exp: { type: DataTypes.INTEGER, allowNull: false },
      aud: { type: DataTypes.STRING, allowNull: true },
      iss: { type: DataTypes.STRING, allowNull: true },
      refreshToken: {
        type: DataTypes.STRING, allowNull: true
      }
    },
    {
      sequelize,
      modelName: "auth",
    }
  );
  return auth;
};
