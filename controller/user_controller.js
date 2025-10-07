const { sendmessage } = require('../additional_functionalities/lunch_bot')
const { sequelize } = require('../config/dbconnect')
const { user_schema, update_user_schema } = require('../middleware/validation')
const { permissions } = require('../model/permissions_model')
const { rolepermissions } = require('../model/role_permissions_model')
const { role } = require('../model/roles_model')
const { user } = require('../model/user_model')
const { balance_pool } = require('../model/balance_pool_model')
const bcrypt = require('bcrypt')
const { votes } = require('../model/votes_model')
const { contributions } = require('../model/contributions_model')
const { purchases } = require('../model/purchase_model')
const { dishes } = require('../model/dishes_model')


// users
const getallusers = async (req, res)=>{
    try {
        const data = await user.findAll({
            attributes: { exclude: ['password'] },
            include: [{
                model: role,
                attributes: ['id', 'rolename'],
            },{
                model:votes,
                attributes: ['id']
            },{
                model:contributions,
                attributes: ['id']
            }]
        });
        // Map users to include role id and role name at top level
        const usersWithRole = data.map(u => {
            const userObj = u.toJSON();
            if (userObj.role) {
                userObj.role_name = userObj.role.rolename;
                delete userObj.role;
            }
            return userObj;
        });
        return res.status(200).json({ data: usersWithRole });
    } catch (error) {
        console.error("Error in fetching users:", error);
        return res.status(500).json({ Error: error.message });
    }
}

const getuser = async (req, res)=>{
    try {
        const curr_user = await user.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: role,
                attributes: ['id', 'rolename'],
            }]
        });
        if (!curr_user) return res.status(500).json({Error: 'user not found'})
        const userObj = curr_user.toJSON();
        if (userObj.role) {
            userObj.role_name = userObj.role.rolename;
            delete userObj.role;
        }
        return res.status(200).json({ data: userObj });
    } catch (error) {
        console.error("Error in fetching users:", error);
        return res.status(500).json({ Error: error.message });
    }
}

const addbalance = async (req, res)=>{
    try {
        const curr_user = await user.findByPk(req.params.id);
        if (!curr_user) return res.status(500).json({ Error: 'user not found' });

        const amount = Math.abs(parseInt(req.params.ammount))

        curr_user.account_balance += amount;
        await curr_user.save();

        return res.status(200).json({ message: 'success', data: { id: curr_user.id, account_balance: curr_user.account_balance } });
    } catch (error) {
        console.error('Error in addbalance:', error);
        return res.status(500).json({ Error: error.message });
    }
}

const subbalance = async (req, res)=>{
    try {
        const curr_user = await user.findByPk(req.params.id);
        if (!curr_user) return res.status(500).json({ Error: 'user not found' });

        const amount = Math.abs(parseInt(req.params.ammount))

        curr_user.account_balance -= amount;
        await curr_user.save();

        return res.status(200).json({ message: 'success', data: { id: curr_user.id, account_balance: curr_user.account_balance } });
    } catch (error) {
        console.error('Error in addbalance:', error);
        return res.status(500).json({ Error: error.message });
    }
}

// transfer from and to pool takes money from balance pool adds to collectors wallet or takes money from collectors wallet subs the bill add any remaining ammmoint to the balance pool

const transfertopool = async (req, res) => {
    const t = await sequelize.transaction();
    try {

        const purchasecheck = await balance_pool.findByPk(1)
        if (purchasecheck.purchase_check == false){
        const curr_user = await user.findByPk(req.params.id, { transaction: t });
        if (!curr_user) {
            await t.rollback();
            return res.status(500).json({ Error: 'user not found' });
        }

        let amount = curr_user.account_balance;
        const items = await purchases.findAll({ include: [{model: dishes, attributes: ['price'], },],})
        let bill = 0
        items.forEach(i => {
        bill += i.quantity * i.dish.price
        })

        amount -=bill

        if (amount < 0) {
            await t.rollback();
            return res.status(400).json({ Error: 'collector account balance is in the negative' });
        }


        let pool = await balance_pool.findOne({ transaction: t });
        if (!pool) {
            pool = await balance_pool.create({ total: 0 }, { transaction: t });
        }

        curr_user.account_balance = 0;
        pool.total += amount;

        if (pool.total < 0) {
            await t.rollback();
            return res.status(400).json({ Error: 'Balance pool cannot be negative' });
        }

        await curr_user.save({ transaction: t });
        await pool.save({ transaction: t });
        purchasecheck.purchase_check = true
        await purchasecheck.save({transaction: t})
        await t.commit();
        return res.status(200).json({ message: 'success', data: { user_id: curr_user.id, user_balance: curr_user.account_balance, pool_total: pool.total } });
        }
        else throw new Error('purchase has already been made')
    } catch (error) {
        await t.rollback();
        console.error('Error in transferToPool:', error);
        return res.status(500).json({ Error: error.message });
    }
};

const transferfrompool = async (req, res) => {
    const t = await sequelize.transaction();
    try {
         const purchasecheck = await balance_pool.findByPk(1)
        if (purchasecheck.purchase_check == false){
        const curr_user = await user.findByPk(req.params.id, { transaction: t });
        if (!curr_user) {
            await t.rollback();
            return res.status(500).json({ Error: 'user not found' });
        }

        const amount = Math.abs(parseInt(req.params.ammount));
        if (isNaN(amount) || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ Error: 'Invalid amount' });
        }

        let pool = await balance_pool.findOne({ transaction: t });
        if (!pool) {
            await t.rollback();
            return res.status(400).json({ Error: 'Balance pool not found' });
        }

        if (pool.total < amount) {
            await t.rollback();
            return res.status(400).json({ Error: 'Insufficient balance pool funds' });
        }

        pool.total -= amount;
        curr_user.account_balance += amount;

        // if (curr_user.account_balance < 0) {
        //     await t.rollback();
        //     return res.status(400).json({ Error: 'User balance cannot be negative' });
        // }

        await pool.save({ transaction: t });
        await curr_user.save({ transaction: t });
        await t.commit();
        return res.status(200).json({ message: 'success', data: { user_id: curr_user.id, user_balance: curr_user.account_balance, pool_total: pool.total } });
        }
        else throw new Error('purchase has already been made')
    } catch (error) {
        await t.rollback();
        console.error('Error in transferFromPool:', error);
        return res.status(500).json({ Error: error.message });
    }
};


const purchasecheck = async (req, res)=>{
    try {
        const check = await balance_pool.findByPk(1)
        return res.status(200).json({message: 'success', data: check.purchase_check})
    } catch (error) {
        return res.status(500).json({ Error: error.message });
    }
}




const updatebyuser = async (req, res)=>{
    try {
        const {error} = update_user_schema.validate(req.body)
        if(error) return res.status(400).json({Error : error.details[0].message})

        const curr_user  = await user.findByPk(req.params.id)  
        if (!curr_user) return res.status(500).json({Error: 'user not found'})

        delete req.body.id
        delete req.body.roleid
        delete req.body.account_balance

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10)
        }

        await curr_user.update(req.body)
        return res.status(200).json({message: "success"})
    } catch (error) {
        console.error("Error in fetching users:", error)
        return res.status(500).json({Error: error.message})
    }
}


const notifyuser = (req, res)=>{
    try {
        sendmessage('lunch reminder from admin!!')
        return res.status(200).json({message: "success"})
    } catch (error) {
        console.log('error while sending message ', error)
        return res.status(500).json({Error : error.message})
    }
}




// roles
const getallroles = async (req, res)=>{
    try {
        const data = await role.findAll();
        return res.status(200).json({ data: data });
    } catch (error) {
        console.error("Error in fetching roles:", error);
        return res.status(500).json({ Error: error.message });
    }
}




// permissions
const getallpermissions = async (req, res)=>{
    try {
        const data = await permissions.findAll();
        return res.status(200).json({ data: data });
    } catch (error) {
        console.error("Error in fetching permissions:", error);
        return res.status(500).json({ Error: error.message });
    }
}


module.exports = {getallusers, getuser, getallroles , getallpermissions, addbalance, subbalance, updatebyuser, notifyuser, transferfrompool, transfertopool, purchasecheck}