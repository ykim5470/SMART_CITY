'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('model_outputs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      op_id: {
				allowNull: false,
				foreignKey: true,
				onDelete: "CASCADE",
				references: {
					model: "model_lists",
					key: "md_id",
				},
				type: Sequelize.UUID,
			},
      op_param: {
        type: Sequelize.STRING,
        allowNull: false
      },
      op_value: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('model_outputs');
  }
};