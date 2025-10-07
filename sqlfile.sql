-- create database lunch_management_system_check;
use lunch_management_system_check;

select * from user;
select * from contributions;
select * from dishes;
select * from permissions;
select * from purchases;
select * from balance_pool;
select * from role_permissions;
select * from roles;
select * from votes;
select * from restaurants;


insert into balance_pool(total) value(2000);

insert into roles(rolename) values('admin'), ('employee'),('collector');

insert into permissions(permissions_name) values ('view'),('add-user'),('edit'),('delete'),('add-role'),('delete-role');

insert into dishes(dish_name, estimated_serving, price, restaurant_id) values('dahi', 0, 100, 1), ('qorma', 2, 300, 2), ('chiken karhai', 2, 400, 2), ('dal', 2, 150, 3), ('biryani', 1, 350, 4);
insert into dishes(id, dish_name, estimated_serving, price, restaurant_id) values(1,'roti', 0, 15, 1), (2,'yogurt', 0, 100, 1), (3, 'salad', 0, 50, 1);

insert into restaurants(id, restaurant_name) values(1, 'general'), (2, 'lucky'), (3, 'restaurant2'), (4, 'restaurant3');

insert into permissions (id, permissions_name) values(1, 'admin-permissions'), (2, 'employee-permissions'), (3, 'collector-permissions');

insert into role_permissions(id, roleid, permission_id) values(1, 1, 1), (2, 2, 2), (3, 3, 3);