'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.belongsTo(models.User, { foreignKey: 'id_receiver',  as: 'receiver' })
      Chat.belongsTo(models.User, { foreignKey: 'id_sender', as: 'sender' })
    }
  };
  Chat.init({
    id_sender: DataTypes.INTEGER,
    id_receiver: DataTypes.INTEGER,
    message: DataTypes.STRING,
    isLatest: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};