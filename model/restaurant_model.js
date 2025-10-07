const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const restaurants = sequelize.define(
    'restaurants',
    {
        id:{
            type: DataTypes.INTEGER,
            required: true,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
        },
        restaurant_name:{
            type: DataTypes.STRING,
            required: true,
            allowNull: false,
            unique: true,
        },
        
    },
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {restaurants}