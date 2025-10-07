const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');


const balance_pool = sequelize.define(
    'balance_pool',
    {
        total:{
            type: DataTypes.INTEGER,
        },
        purchase_check: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
},
{
    timestamps: false,
    freezeTableName: true,
}
)


module.exports = {balance_pool}