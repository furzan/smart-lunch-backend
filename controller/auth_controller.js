const { sequelize } = require('../config/dbconnect')
const { user_schema, update_user_schema } = require('../middleware/validation')
const { role } = require('../model/roles_model')
const { user } = require('../model/user_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const register = async(req, res)=>{
    
    // register user using id, name, email, roleid, password
    // hash password for security 

    try {
        const {id, name, email, roleid, password} = req.body
        if (!name || !password || !roleid || !id || !email) {
            return res.status(400).json({ Error: "Complete information is not provided" });
        }

        const {error} = user_schema.validate(req.body)
        if(error) return res.status(400).json({ Errors: error.details.map(detail => ({ message: detail.message, path: detail.path, type: detail.type }))})

        const hashedpassword = await bcrypt.hash(password, 10)
        
        const newuser = await user.create({
            id : id,    
            name: name,
            email: email,
            roleid: roleid || 2,
            password: hashedpassword,
            })

        console.log("User registered successfully:", newuser)

        return res.status(201).json({message: "sucess", user: {id: newuser.id, name: newuser.name, email: newuser.email, role: newuser.roleid } })
    }
    catch (error) {
        console.error("Error in user registration:", error)
        return res.status(500).json({Error: error})
    }
}


const login = async(req, res)=>{

    // check user credentials( email and password ) for login
    // if correct credentials are entered then sucessful login and assign jwt to logged in user 

    try {

        const {email,password} = req.body
        const existingUser = await user.findOne({ where: { email: email } })
        
        if (!existingUser) return res.status(404).json({Error: "user does not exist"})

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) return res.status(400).json({Error: "Invalid password"})

        const token = jwt.sign(
            { id: existingUser.id, name: existingUser.name, email: existingUser.email, roleid: existingUser.roleid, account_balance: existingUser.account_balance, regular: existingUser.regular},
            process.env.JWT_SECRET_KEY,
            // { expiresIn: '10h' }
        )

        existingUser.token = token
        await existingUser.save()


        res.status(200).json({message: "success", token: token, role: existingUser.roleid, id: existingUser.id})
        
    } catch (error) {
        console.error("Error in user login:", error)
        return res.status(500).json({Error: error.message})
    }

}


const delete_user = async (req, res)=>{
    try {
        const curr_user = await user.findByPk(req.params.id)
        if (!curr_user) return res.status(500).json({Error: 'user not found'})

        await curr_user.destroy()
        return res.status(200).json({message: "success"})
    } catch (error) {
        console.error("Error in fetching users:", error)
        return res.status(500).json({Error: error.message})
    }
}

const update_user = async (req, res)=>{
    try {
        const {error} = update_user_schema.validate(req.body)
        if(error) return res.status(400).json({ Errors: error.details.map(detail => ({ message: detail.message, path: detail.path, type: detail.type }))})

        const curr_user  = await user.findByPk(req.params.id)  
        if (!curr_user) return res.status(500).json({Error: 'user not found'})

        delete req.body.id

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




module.exports = {register, login, delete_user, update_user}