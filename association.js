const { permissions } = require("./model/permissions_model");
const { rolepermissions } = require("./model/role_permissions_model");
const { role } = require("./model/roles_model");
const { user } = require("./model/user_model");
const { contributions } = require("./model/contributions_model");
const { votes } = require("./model/votes_model");
const { dishes } = require("./model/dishes_model");
const { purchases } = require("./model/purchase_model");
const { restaurants } = require("./model/restaurant_model");

user.belongsTo(role, 
    { 
        foreignKey: 'roleid' 
    });

role.hasMany(user, 
    { 
        foreignKey: 'roleid' ,
        onDelete: 'CASCADE'
    });

// role.belongsToMany(permissions, {
//   through: rolepermissions,
//   foreignKey: 'roleid',
//   otherKey: 'permission_id'
// });

// permissions.belongsToMany(role, {
//   through: rolepermissions,
//   foreignKey: 'permission_id',
//   otherKey: 'roleid'
// });



user.hasOne(contributions, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
contributions.belongsTo(user, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

user.hasOne(votes, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
votes.belongsTo(user, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// dishes.hasMany(votes, {
//   foreignKey: 'dish_id',
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// });
// votes.belongsTo(dishes, {
//   foreignKey: 'dish_id',
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE'
// });

dishes.hasOne(purchases, {
  foreignKey: 'dish_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
purchases.belongsTo(dishes, {
  foreignKey: 'dish_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

contributions.hasOne(votes, {
  foreignKey: 'contribution_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
votes.belongsTo(contributions, {
  foreignKey: 'contribution_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

restaurants.hasMany(dishes, {
  foreignKey: 'restaurant_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
dishes.belongsTo(restaurants, {
  foreignKey: 'restaurant_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});