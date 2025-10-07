const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const purchases = sequelize.define(
  'purchases',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dish_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    price:{
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    createdAt: 'date',     
    updatedAt: false       
  }
);



module.exports = {purchases}