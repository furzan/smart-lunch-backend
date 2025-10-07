const joi = require('joi')

const user_schema = joi.object({
    
    id: joi.number().integer().required(),
    name: joi.string().min(3).max(40).required(),
    email: joi.string().email().required(),
    roleid: joi.number().integer().max(3).min(1).required(),

    regular: joi.boolean().default(false),
    account_balance: joi.number().integer().default(0),

    password: joi.string().min(6).max(20).required(),

})

const update_user_schema = joi.object({
   
    name: joi.string().min(3).max(40),
    email: joi.string().email(),
    roleid: joi.number().integer().min(1).max(3),
    regular: joi.boolean(),
    account_balance: joi.number().integer(),
    password: joi.string().min(6).max(20),

});

const check_contribution = joi.object({
    
    user_id: joi.number().integer().required(),
    amount_paid: joi.number().integer().min(0).valid(70, 150).required(),
    brought_food: joi.boolean().required(),
    
    dish: joi.string().when('brought_food', {
    is: true,
    then: joi.string().min(1).required(),
    otherwise: joi.string().optional().allow('')
    }),

    plates: joi.number().integer().when('brought_food', {
        is: true,
        then: joi.number().integer().min(1).required(),
        otherwise: joi.number().optional()
    })

})


module.exports = {user_schema, update_user_schema, check_contribution}
