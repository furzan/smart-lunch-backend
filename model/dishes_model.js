const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const dishes = sequelize.define(
    'dishes',
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dish_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        estimated_serving:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        restaurant_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
},
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {dishes}