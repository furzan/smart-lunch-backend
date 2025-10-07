const cron = require('node-cron');
const { sendmessage } = require('./additional_functionalities/lunch_bot');
const { purchases } = require('./model/purchase_model');
const { votes } = require('./model/votes_model');
const { contributions } = require('./model/contributions_model');
const { balance_pool } = require('./model/balance_pool_model');

cron.schedule('00 12 * * *', () => {
  sendmessage('Its almost time for lunch!!');
  console.log('Lunch reminder sent');
});



cron.schedule('00 10 * * *', async () => {
  const sequelize = purchases.sequelize || votes.sequelize || contributions.sequelize || balance_pool.sequelize;
  const t = await sequelize.transaction();
  try {
    await purchases.destroy({ where: {}, transaction: t });
    await contributions.destroy({ where: {}, transaction: t });
    await votes.destroy({ where: {}, transaction: t });

    const purchasecheck = await balance_pool.findByPk(1, { transaction: t });
    if (purchasecheck) {
      purchasecheck.purchase_check = false;
      await purchasecheck.save({ transaction: t });
    }
    else{
      await balance_pool.create({ total: 0 }, { transaction: t })
    }

    await t.commit();
    console.log('Purchases, votes, and contributions tables emptied and purchase check initialised');
  } catch (error) {
    await t.rollback();
    console.error('Error emptying tables (transaction rolled back):', error);
  }
});




cron.schedule('30 12 * * *', async () => {
  const sequelize = contributions.sequelize || balance_pool.sequelize;
  const t = await sequelize.transaction();
  try {
    let prev_saved = await balance_pool.findByPk(1, { transaction: t });
    if (!prev_saved) {
      prev_saved = await balance_pool.create({ total: 0 }, { transaction: t });
    }
    const contributed = await contributions.findAll({ transaction: t });
    let total = 0;
    for (let item of contributed) {
      total += item.amount_paid;
      item.amount_paid = 0;
      await item.save({ transaction: t });
    }
    prev_saved.total += total;
    await prev_saved.save({ transaction: t });
    await t.commit();
    console.log('contribution ammount sent to balancepool ')
  } catch (error) {
    await t.rollback();
    console.log('Error while setting balance pool (transaction rolled back): ' + error);
  }
});

module.exports = cron;