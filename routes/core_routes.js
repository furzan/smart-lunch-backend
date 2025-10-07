const express = require('express');
const { verifytoken } = require('../middleware/auth_middleware');
const { addcontribution, votingresults, deleteContribution, numparticipants, numvotes, totalbudget, platesneeded, createVote, createDish, getAllDishes, getAllPurchases, createPurchase, getallcontributiona, gettotalbill, addrestaurant, getrestaurants, deleterestaurant, deletevote, deleteppurchase, getbalancepool, addbalancepool, subbalancepool, getbudgetdishes, getallvotes, finalize_dishes, deletedish, deleteallpurchases, getdishesbyrestaurant, gettotalroti, getvotebyuserid } = require('../controller/core_controller');


const router = express.Router()

// contributions

router.get('/getallcontributions', getallcontributiona ) //

router.post('/addcontribution', addcontribution) //

router.delete('/deletecontribution/:id', deleteContribution) //

router.get('/getnumparticipants', numparticipants) //

router.get('/gettotalbudget', totalbudget) //

router.get('/getplatesneeded', platesneeded) //

// restaurants

router.post('/addrestaurant', addrestaurant) //

router.get('/getallrestaurants', getrestaurants) //

router.delete('/deleterestaurant/:id', deleterestaurant) //

// dishes

router.post('/adddish', createDish) //

router.get('/getalldishes', getAllDishes) //

router.get('/getdishesbyrestaurant', getdishesbyrestaurant) //

router.get('/getbudgetdishes/:totalbudget', getbudgetdishes) //

router.get('/finalizedishes/:platesneeded', finalize_dishes) //

router.delete('/deletedidh/:id', deletedish)

// votes

router.post('/addvote', createVote) //

router.get('/getnumvotes', numvotes) //

router.get('/getallvotes', getallvotes) //

router.delete('/deletevote/:user_id', deletevote) //

router.get('/votingresults', votingresults) //

router.get('/gettotalroti', gettotalroti) //

router.get('/getvotebyuserid/:id', getvotebyuserid) //

//  purchases

router.post('/addpurchase' , createPurchase) //

router.get('/getallpurchases', getAllPurchases) //

router.delete('/deletepurchase/:id', deleteppurchase) //

router.delete('/deleteallpurchase', deleteallpurchases) //

router.get('/gettotalbill', gettotalbill) //


// balance_pool

router.get('/getbalancepool', getbalancepool) //

router.put('/addbalancepool/:ammount', addbalancepool) //

router.put('/subbalancepool/:ammount', subbalancepool) //

// summary 

// router.get('/')


module.exports = router