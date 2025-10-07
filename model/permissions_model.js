const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const permissions = sequelize.define(
    'permissions',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement : true,
        },
        permissions_name:{
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


module.exports = {permissions}