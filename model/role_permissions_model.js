const {sequelize} = require("../config/dbconnect");
const {DataTypes } = require('sequelize');



const rolepermissions = sequelize.define('role_permissions', {
  roleid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: false, // Disable automatic createdAt & updatedAt
  freezeTableName: true,
});

module.exports = { rolepermissions };