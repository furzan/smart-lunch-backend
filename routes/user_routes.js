const express = require('express');
const { getallusers, getuser, getallroles, getallpermissions, addbalance, subbalance, updatebyuser, notifyuser, transferfrompool, transfertopool, purchasecheck } = require('../controller/user_controller');
const { verifytoken } = require('../middleware/auth_middleware');

const router = express.Router()

// users
router.get('/getallusers' , getallusers)

router.get('/getuser/:id' , getuser)

router.put('/addbalance/:id/:ammount' , addbalance)

router.put('/subbalance/:id/:ammount' , subbalance)

router.put('/transferfrompool/:id/:ammount' , transferfrompool)

router.put('/transfertopool/:id' , transfertopool)

router.get('/purchasecheck', purchasecheck)

router.put('/updatebyuser/:id' , updatebyuser)

router.get('/notifyusers' , notifyuser)

// roles
router.get('/getallroles' , getallroles)

// permissions
router.get('/getallpermissions' , getallpermissions)




module.exports = router
