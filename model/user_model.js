const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const user = sequelize.define(
    'user',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        name:{
            type: DataTypes.STRING,
            required: true,
        },
        email:{
            type: DataTypes.STRING,
            required:true,
            unique: true,
        },
        roleid:{
            type: DataTypes.INTEGER,
            required: true,
        },
        account_balance:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        regular:{
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        token:{
            type: DataTypes.STRING,
        },
        password:{
            type:DataTypes.STRING,
            required: true,
        },
},
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {user}