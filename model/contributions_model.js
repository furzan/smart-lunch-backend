const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const contributions = sequelize.define(
    'contributions',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement : true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        date:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        amount_paid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        brought_food: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        dish: {
            type: DataTypes.STRING
        },
        plates: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
},
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {contributions}