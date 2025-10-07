const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../config/dbconnect");
const { check_contribution } = require("../middleware/validation");
const { contributions } = require("../model/contributions_model");
const { dishes } = require("../model/dishes_model");
const { user } = require("../model/user_model");
const { votes } = require("../model/votes_model");
const { balance_pool } = require("../model/balance_pool_model");
const { purchases } = require("../model/purchase_model");
const { restaurants } = require("../model/restaurant_model");


// dash board upper stats

const numparticipants = async (req, res)=>{
    try {
        const participants = await contributions.findAll()
        return res.status(200).json({message:'success', data: participants.length})
    } catch (error) {
        console.log('eroor while retriving num of participants ' + error)
        return res.status(500).json({ Error: error.message })
    }
}

const numvotes = async (req, res)=>{
    try {
        const num_votes = await votes.findAll()
        return res.status(200).json({message:'success', data: num_votes.length})
    } catch (error) {
        console.log('error while retriving num of votes ' + error)
        return res.status(500).json({ Error: error.message })
    }
}
const totalbudget = async (req, res) => {
    try {
        const prev_saved = await balance_pool.findByPk(1);
        const contributed = await contributions.findAll();
        let total = prev_saved?.total || 0;
        for (let item of contributed) total += item.amount_paid

        return res.status(200).json({message: 'success', data: total });
    } catch (error) {
        console.log('Error while retrieving budget: ' + error);
        return res.status(500).json({ Error: error.message });
    }
};


const platesneeded = async (req, res) => {
    try {
        const participants = await contributions.findAll();
        const numParticipants = participants.length;
        let totalPlatesNeeded = Math.ceil(numParticipants / 2);
        for (let participant of participants) {
            if (participant.brought_food === true) {
                totalPlatesNeeded -= participant.plates_brought || 0;
            }
        }

        totalPlatesNeeded = Math.max(totalPlatesNeeded, 0);

        return res.status(200).json({ message: 'success' , data: totalPlatesNeeded });

    } catch (error) {
        console.log('Error while retrieving num of plates: ' + error);
        return res.status(500).json({ Error: error.message });
    }
}




// contributions 

const getallcontributiona = async (req, res)=>{
  try {
      const data = await contributions.findAll({
        include: [{model: user, attributes: ['name'], },],
      })
      return res.status(200).json({message: 'success', data: data})
  } catch (error) {
      console.log('error while retriving num of votes ' + error)
      return res.status(500).json({ Error: error.message })
  }
}

const addcontribution = async (req, res)=>{

    const t = await sequelize.transaction()

    try {
        const { error } = check_contribution.validate(req.body);
        if (error) return res.status(400).json({ Error: error.details[0].message });

        await contributions.create(req.body, { transaction: t });

        const curr_user = await user.findByPk(req.body.user_id);
        if (!curr_user) throw new Error("User not found");

        curr_user.account_balance -= req.body.amount_paid;
        await curr_user.save({ transaction: t });

        await t.commit();
        return res.status(200).json({ message: "success" });
    } catch (error) {
        await t.rollback();
        console.error("Error in adding contribution:", error);
        return res.status(500).json({ Error: error.message });
    }
}

const deleteContribution = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const contribution_id = req.params.id;
        if (!contribution_id) return res.status(400).json({ Error: "Contribution ID is required" });

        const contribution = await contributions.findByPk(contribution_id);
        if (!contribution) return res.status(404).json({ Error: "Contribution not found" });

        const curr_user = await user.findByPk(contribution.user_id);
        if (!curr_user) throw new Error("User not found");

        curr_user.account_balance += contribution.amount_paid;
        await curr_user.save({ transaction: t });

        await contribution.destroy({ transaction: t });

        await t.commit();
        return res.status(200).json({ message: "success" });

    } catch (error) {
        await t.rollback();
        console.error("Error in deleting contribution:", error);
        return res.status(500).json({ Error: error.message });
    }
};


// restaurants

const addrestaurant = async (req, res)=>{
  try {
    const { restaurant_name } = req.body
    await restaurants.create({restaurant_name})
    return res.status(200).json({message: 'success'})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}

const getrestaurants = async (req, res)=>{
  try {
    const rest = await restaurants.findAll()
    return res.status(200).json({message: 'success', data: rest})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}

const deleterestaurant = async (req, res)=>{
  try {
    const restaurant = await restaurants.findByPk(req.params.id)
    if (!restaurant) return res.status(500).json({Error: 'restaurant not found'})
    await restaurant.destroy()
    return res.status(200).json({message: 'success'})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}


// voting 

const createVote = async (req, res) => {
  try {
    const { user_id, dish_id, roti, nan, contribution_id } = req.body;
    const contribution = await contributions.findByPk(contribution_id)

    if( contribution.user_id != user_id ) throw new Error("contribution id is of a different user")
    


    const participants = await contributions.findAll();
    const numParticipants = participants.length;
    let totalPlatesNeeded = Math.ceil(numParticipants / 2);
    for (let participant of participants) {
        if (participant.brought_food === true) {
            totalPlatesNeeded -= participant.plates_brought || 0;
        }
    }

    totalPlatesNeeded = Math.max(totalPlatesNeeded, 0);  

    const dvotes = dish_id.split(',').map(id => id.trim())

    if( dvotes.length > totalPlatesNeeded ) throw new Error("number of dishes voted exceed the number of plates needed")



    const newVote = await votes.create({ user_id, dish_id, roti, nan, contribution_id });
    return res.status(201).json({message: 'success', data: newVote});
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

const getallvotes = async (req, res)=>{
  try {
    const vote = await votes.findAll()
    return res.status(200).json({message: 'success', data: vote})
  } catch (error) {
    console.error('Error fetching votes:', error);
    return res.status(500).json({ Error: error.message });
  }
}

const votingresults = async (req, res) => {
  try {
    const allVotes = await votes.findAll({ attributes: ['dish_id'] });

    const voteCounts = {};

    allVotes.forEach((vote) => {
      const dishIds = vote.dish_id.split(',').map(id => id.trim());

      dishIds.forEach((id) => {
        if (!voteCounts[id]) {
          voteCounts[id] = 0;
        }
        voteCounts[id] += 1;
      });
    });

    const votedDishIds = Object.keys(voteCounts);

    if (votedDishIds.length === 0) {
      return res.status(200).json({ message: 'success', data: [] });
    }

    const dishesData = await dishes.findAll({
      include: [{model: restaurants, attributes: ['restaurant_name'], },],
      where: { id: votedDishIds },
      attributes: ['id', 'dish_name', 'restaurant_id'],
    });

    const results = dishesData.map((dish) => ({
      id: dish.id,
      dish_name: dish.dish_name,
      restaurant_id: dish.restaurant_id,
      restaurant_name: dish.restaurant.restaurant_name,
      vote_count: voteCounts[dish.id] || 0,
    }));

    return res.status(200).json({ message: 'success', data: results });

  } catch (error) {
    console.error('Error fetching voting results:', error);
    return res.status(500).json({ Error: error.message });
  }
};


const deletevote = async (req, res)=>{
  try {
    const vote = await votes.findAll({where: {user_id: req.params.user_id}})
    if (!vote) return res.status(500).json({Error: 'vote not found'})
    await vote[0].destroy()
    return res.status(200).json({message: 'success'})
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
}

const gettotalroti = async (req, res) =>{
  try {
    const cont = await contributions.findAll();
    const vote = await votes.findAll();
    let totroti = 0;
    vote.forEach(v => {
      if (v.roti !== undefined && v.roti !== null && !isNaN(v.roti)) {
        totroti += Number(v.roti);
      }
    });
    totroti += (cont.length - vote.length) * 2;

    return res.status(200).json({ message: 'success', data: totroti });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
}

const getvotebyuserid = async (req, res)=>{
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ Error: "User id is required" });
    }
    const vote = await votes.findOne({ where: { user_id: userId } });
    if (!vote) {
      return res.status(404).json({ Error: "Vote not found for this user" });
    }
    return res.status(200).json({ message: "success", vote_id: vote.id });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
}


// dishes

const createDish = async (req, res) => {
  try {
    const { dish_name, estimated_serving, price, restaurant_id } = req.body;
    const newDish = await dishes.create({ dish_name, estimated_serving, price, restaurant_id });
    res.status(201).json({message: 'success', data: newDish});
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

const getAllDishes = async (req, res) => {
  try {
    const allDishes = await dishes.findAll();
    res.status(200).json({message: 'success', data: allDishes});
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};


const getdishesbyrestaurant = async (req, res) => {
  try {
    const allRestaurants = await restaurants.findAll({
      where: { id: { [Op.ne]: 1 } },
      include: [{ model: dishes, attributes: ['id', 'dish_name', 'restaurant_id', 'price'] }],
      attributes: ['id', 'restaurant_name']
    });
    return res.status(200).json({ message: 'success', data: allRestaurants });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
}


const getbudgetdishes = async (req, res) => {
  try {
    const availablemoney = req.params.totalbudget

    if (!availablemoney || availablemoney <= 0) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const affordableDishes = await dishes.findAll({
      where: {
        price: {
          [Op.lte]: availablemoney/2, 
        },
      },
    });

    res.status(200).json({ message: 'success', data: affordableDishes });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};


const finalize_dishes = async (req, res) => {
  try {
    const platesneeded = parseInt(req.params.platesneeded);
    if (isNaN(platesneeded) ) {
      return res.status(400).json({ error: "Invalid platesneeded" });
    }
    if (platesneeded < 1) {
      return res.status(200).json({ message: 'success', data: [] });
    }

    const allRestaurants = await restaurants.findAll({
      include: [{ model: dishes, attributes: ['id', 'dish_name', 'restaurant_id', 'price'] }],
      attributes: ['id', 'restaurant_name']
    });

    const allVotes = await votes.findAll({ attributes: ['dish_id'] });

    const dishVoteCounts = {};
    allVotes.forEach(vote => {
      const ids = typeof vote.dish_id === 'string' ? vote.dish_id.split(',').map(id => id.trim()) : [vote.dish_id];
      ids.forEach(id => {
        if (!dishVoteCounts[id]) dishVoteCounts[id] = 0;
        dishVoteCounts[id] += 1;
      });
    });

    const result = allRestaurants.map(rest => {
      let totalVotes = 0;
      const dishList = (rest.dishes || []).map(dish => {
        const count = dishVoteCounts[dish.id] || 0;
        totalVotes += count;
        return {
          id: dish.id,
          dish_name: dish.dish_name,
          votes: count,
          price: dish.price
        };
      });
      return {
        restaurant_id: rest.id,
        restaurant_name: rest.restaurant_name,
        total_votes: totalVotes,
        dishes: dishList
      };
    });

    // Find the restaurant with the most total votes
    const maxVotedRestaurant = result.reduce((max, restaurant) => {
      return (restaurant.total_votes > max.total_votes) ? restaurant : max;
    }, result[0]);

    // Sort dishes by votes descending
    const sortedDishes = [...maxVotedRestaurant.dishes].sort((a, b) => b.votes - a.votes);

    // Filter dishes with votes > 0
    let topDishes = sortedDishes.filter(d => d.votes > 0);

    // If no voted dishes, fallback to top dishes by default order
    if (topDishes.length === 0) topDishes = sortedDishes.slice(0, platesneeded);

    // Initialize quantities for voted dishes
    const dishQuantities = topDishes.map(dish => ({ ...dish, quantity: 0 }));

    // Distribute platesneeded among the selected dishes
    for (let i = 0; i < platesneeded; i++) {
      dishQuantities[i % dishQuantities.length].quantity += 1;
    }

    // Create a mapping of quantities to assign back to original dishes
    const quantityMap = {};
    dishQuantities.forEach(d => {
      quantityMap[d.id] = d.quantity;
    });

    // Finalize all dishes with quantity (0 if not selected)
    let updatedDishes = maxVotedRestaurant.dishes.map(dish => ({
      ...dish,
      quantity: quantityMap[dish.id] || 0
    }));

    // --- Add dishes from restaurant 1 (if not already included) ---
    const restaurant1 = allRestaurants.find(r => r.id === 1 || r.id === '1');
    if (restaurant1 && Array.isArray(restaurant1.dishes)) {
      const existingDishIds = new Set(updatedDishes.map(d => d.id));
      const restaurant1Dishes = restaurant1.dishes
        .filter(dish => !existingDishIds.has(dish.id))
        .map(dish => ({
          id: dish.id,
          dish_name: dish.dish_name,
          votes: dishVoteCounts[dish.id] || 0,
          price: dish.price,
          quantity: 0
        }));
      updatedDishes = updatedDishes.concat(restaurant1Dishes);
    }
    // --- End add dishes from restaurant 1 ---

    // Update result
    maxVotedRestaurant.dishes = updatedDishes;

    return res.status(200).json({ message: 'success', data: maxVotedRestaurant });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};


const deletedish = async (req, res) =>{
  try {
    const dish = await dishes.findByPk(req.params.id)
    if (!dish) return res.status(500).json({Error: 'dish not found'})
    await dish.destroy()
    return res.status(200).json({message: 'success'})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}




// purchase

const createPurchase = async (req, res) => {
  try {
    const purchasesArray = req.body; 

    if (!Array.isArray(purchasesArray) || purchasesArray.length === 0) {
      throw new Error("Request body must be a non-empty array of purchases");
    }

    const dishIds = purchasesArray.map(p => p.dish_id);
    const allDishes = await dishes.findAll({ where: { id: dishIds } });

    if (allDishes.length !== dishIds.length) {
      throw new Error("Some dish IDs are invalid");
    }

    const restaurantIds = new Set(allDishes.map(d => d.restaurant_id));
    // Allow purchases from any one restaurant plus restaurant 1 only
    if (
      restaurantIds.size > 2 ||
      (restaurantIds.size === 2 && !restaurantIds.has(1) && !restaurantIds.has('1'))
    ) {
      throw new Error("Purchases must be from a single restaurant or a single restaurant plus restaurant 1");
    }

    let totalPrice = 0;
    const purchaseRecords = purchasesArray.map(({ dish_id, quantity }) => {
      if (quantity < 1) throw new Error("Quantity must be at least 1");

      const dish = allDishes.find(d => d.id === dish_id);
      const dishTotal = dish.price * quantity;
      totalPrice += dishTotal;

      return { dish_id, quantity, price: dishTotal };
    });

    const prev_saved = await balance_pool.findByPk(1);
    if (!prev_saved) balance_pool.create({total:0})
    const contributed = await contributions.findAll();
    let budget = prev_saved.total || 0;
    for (let item of contributed) budget += item.amount_paid

    if (totalPrice > budget) throw new Error('total bill is greater than avalble funds')

    const newPurchases = await purchases.bulkCreate(purchaseRecords);

    return res.status(201).json({message: "success", total_price: totalPrice, purchases: newPurchases });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};




const getAllPurchases = async (req, res) => {
  try {
    const allPurchases = await purchases.findAll({
      include: [{ model: dishes, attributes: ['dish_name'] }]
    });
    // Map to include dish_name at top level
    const result = allPurchases.map(p => {
      const obj = p.toJSON();
      obj.dish_name = obj.dish ? obj.dish.dish_name : null;
      delete obj.dish;
      return obj;
    });
    res.status(200).json({message: 'success', data: result});
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

const gettotalbill = async(req, res)=>{
  try {
    const items = await purchases.findAll({ include: [{model: dishes, attributes: ['price'], },],})
    let bill = 0
    items.forEach(i => {
      bill += i.quantity * i.dish.price
    });

    return res.status(200).json({message: 'success', data: bill})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}


const deleteppurchase = async (req, res)=>{
  try {
    const purchase = await purchases.findByPk(req.params.id)
    if (!purchase) return res.status(500).json({Error: 'purchase not found'})
    await purchase.destroy()
    return res.status(200).json({message: 'success'})
  } catch (error) {
    return res.status(500).json({ Error: error.message })
  }
}

const deleteallpurchases = async (req, res) => {
  try {
    await purchases.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};



// balance_pool

const getbalancepool = async (req, res) => {
  try {
    const balnace = await balance_pool.findAll();
    res.status(200).json({message: 'success', data: balnace});
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

const addbalancepool = async (req, res)=>{
    try {
        const balance = await balance_pool.findByPk(1);
        if (!balance) {
          balance_pool.create({total:0})
          return res.status(500).json({ message: 'balance pool not found, new balance pool created' })
        };

        const ammount = Math.abs(parseInt(req.params.ammount))
        console.log('ammount is   : ' + ammount)

        balance.total += ammount;
        await balance.save();

        return res.status(200).json({ message: 'success', data: balance.total });
    } catch (error) {
        console.error('Error in addbalance:', error);
        return res.status(500).json({ Error: error.message });
    }
}

const subbalancepool = async (req, res)=>{
    try {
        const balance = await balance_pool.findByPk(1);
        if (!balance) {
          balance_pool.create({total:0})
          return res.status(500).json({ message: 'balance pool not found, new balance pool created' })
        };

        const amount = Math.abs(parseInt(req.params.ammount))

        balance.total -= amount;
        await balance.save();

        return res.status(200).json({ message: 'success', data: balance.total });
    } catch (error) {
        console.error('Error in addbalance:', error);
        return res.status(500).json({ Error: error.message });
    }
}

// summary 

const getSummary = async (req, res) => {
  try {
    const summary = await purchases.findAll({
      attributes: [
        'dish_id',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity'],
        [Sequelize.literal('SUM(quantity * dish.price)'), 'total_price']
      ],
      include: [{
        model: dishes,
        attributes: ['dish_name', 'price']
      }],
      group: ['dish_id', 'dish.id']
    });

    let sentenceParts = [];
    let grandTotal = 0;

    summary.forEach(item => {
      const dishName = item.dish.dish_name;
      const quantity = item.get('total_quantity');
      const totalPrice = parseFloat(item.get('total_price'));
      grandTotal += totalPrice;
      sentenceParts.push(`${quantity} ${dishName}(s)`);
    });

    const sentence = `Ordered dishes include ${sentenceParts.join(', ')} with a total cost of Rs. ${grandTotal.toFixed(2)}.`;

    res.status(200).json({ message: sentence });
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







module.exports = {addcontribution, votingresults, deleteContribution, numparticipants, numvotes, totalbudget, platesneeded, createVote, createDish, getAllDishes, createPurchase, getAllPurchases, getallcontributiona, gettotalbill, addrestaurant, getrestaurants, deleterestaurant, deletevote, deleteppurchase, getbalancepool, addbalancepool, subbalancepool, getbudgetdishes, getSummary, getallvotes, finalize_dishes, deletedish, deleteallpurchases, getdishesbyrestaurant, gettotalroti, getvotebyuserid}