const {Sequelize} = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(
    process.env.DATABASE_NAME, process.env.UNAME, process.env.PASSWORD,
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: false,
        // pool: {
        //     max: 15, // maximum number of connections
        //     min: 0,  // minimum number of connections
        //     acquire: 30000, // max time (ms) to try getting connection before throwing error
        //     idle: 10000 // max time (ms) a connection can be idle before being released
        // }
    }
);

const dbconnection = async()=>{
    try{
        await sequelize.authenticate()
        console.log('database has been sucessfully connected')
    }
    catch(err){
        console.log("Error in db connection", err);
    }
}


module.exports = {dbconnection, sequelize}