const jwt = require('jsonwebtoken');
const { rolepermissions } = require('../model/role_permissions_model');
const { user } = require('../model/user_model');
require('dotenv').config()


const verifytoken = async (req, res, next) => {

    try {
        let token 
        let authheader = req.headers['authorization']; 
    
        if (authheader && authheader.startsWith('Bearer ')) {
            token = authheader.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ Error: "Access denied, no token provided." });
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
            
            const check = await user.findByPk(decode.id)
            if(!check) return res.status(500).json({Error: 'user not found'})

            if(check.token != token) throw new Error('invalid token')

            const permissions = await rolepermissions.findAll({ where: { roleid: decode.roleid }, attributes: ['permission_id'] });

            req.permissions = permissions.map(r => r.permission_id);

            // console.log("Token verified successfully:", decode); 
            // console.log("permissions:", req.permissions); 
            next()
            
        } else {
            return res.status(401).json({ Error: "Access denied, no token provided." });
        }
        }
        catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ Error: "Invalid token." });
        }
}

module.exports = { verifytoken };