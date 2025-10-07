const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const votes = sequelize.define(
  'votes',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    dish_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contribution_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roti:{
        type: DataTypes.INTEGER,
        defaultValue: 2
    },
    nan:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    createdAt: 'date',     // Rename createdAt to "date"
    updatedAt: false       // Disable updatedAt
  }
);



module.exports = {votes}