const express = require('express');
const { login, register, delete_user, update_user } = require('../controller/auth_controller');
const { verifytoken } = require('../middleware/auth_middleware');
const authorize_role = require('../middleware/role_middleware');

const router = express.Router()

router.post('/login', login)

router.post('/register',  register)

router.delete('/deleteuser/:id',  delete_user)

router.put('/updateuser/:id', update_user)

router.get('/authenticateadmin', verifytoken, authorize_role(), (req, res)=>{res.status(200).json({message: 'success'})})

router.get('/authenticateemployee', verifytoken, authorize_role(), (req, res)=>{res.status(200).json({message: 'success'})})

router.get('/authenticatecollector', verifytoken, authorize_role(), (req, res)=>{res.status(200).json({message: 'success'})})


module.exports = router