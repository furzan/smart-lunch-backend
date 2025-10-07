const express = require("express");
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const { dbconnection, sequelize } = require("./config/dbconnect");
const { user } = require("./model/user_model");
const { role } = require("./model/roles_model");
const { permissions } = require("./model/permissions_model");
const { rolepermissions } = require("./model/role_permissions_model");
const { contributions } = require("./model/contributions_model");
const { dishes } = require("./model/dishes_model");
const { purchases } = require("./model/purchase_model");
const { votes } = require("./model/votes_model");
const { balance_pool } = require("./model/balance_pool_model");
const { restaurants } = require("./model/restaurant_model");
const { sendmessage } = require("./additional_functionalities/lunch_bot");
const auth_router = require("./routes/auth_routes");
const user_router = require("./routes/user_routes");
const core_router = require("./routes/core_routes");
require('dotenv').config()
require('./association')
require('./cronJobs')


const app = express()

app.use(express.json())

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true,
})); 


app.use('/auth', auth_router)

app.use('/user', user_router)

app.use('/core', core_router)


sequelize.sync({force : false})

app.listen(4000, async()=>{
    console.log("Server is running on port 4000")
    await dbconnection()
})