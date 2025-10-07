const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const role = sequelize.define(
    'roles',
    {
        id:{
            type: DataTypes.INTEGER,
            required: true,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
        },
        rolename:{
            type: DataTypes.STRING,
            required: true,
            unique: true,
        },
        
    },
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {role}