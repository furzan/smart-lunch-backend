## Smart Lunch Backend

Node.js/Express backend for coordinating team lunch contributions, voting on dishes, selecting restaurants, tracking purchases, and managing a shared balance pool.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Sequelize
- **Database**: MySQL
- **Auth**: JWT
- **Validation**: Joi
- **Scheduling**: node-cron
- **Messaging (optional)**: Slack Web API

## Features
- **Authentication**: Register, login, JWT issuance and verification.
- **Users**: Manage user profiles and balances.
- **Roles & Permissions**: Role-based access hooks integrated in middleware.
- **Contributions**: Track individual payments toward the lunch pool.
- **Restaurants & Dishes**: Manage restaurants and their menus.
- **Voting**: Users vote for dishes; results aggregated by restaurant and dish.
- **Planning**: Compute plates needed, budget-based dish filtering, finalization logic.
- **Purchases**: Create and list purchases; compute totals and summaries.
- **Balance Pool**: Add/subtract from shared pool; pool-user transfers with consistency checks.
- **Cron Jobs**: Scheduled tasks defined in `cronJobs.js`.
- **Slack Bot (optional)**: Simple reminder notifications via Slack if configured.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+ running locally or accessible via network

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```bash
   DATABASE_NAME=smart_lunch_db
   UNAME=root
   PASSWORD=your_mysql_password
   JWT_SECRET_KEY=your_jwt_secret
   # Optional for Slack bot
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_CHANNEL_ID=C1234567890
   ```
4. Ensure your MySQL instance has a database matching `DATABASE_NAME`.

### Run
```bash
npm start
```
The server starts on `http://localhost:4000`. On boot it connects to MySQL and synchronizes Sequelize models.

## Project Structure
```
controller/           # Route handlers (auth, core domain, users)
routes/               # Express routers grouped by domain
model/                # Sequelize models (users, roles, dishes, votes, purchases, etc.)
middleware/           # Auth (JWT), role checks, validation schemas
config/dbconnect.js   # Sequelize setup and DB connection helper
association.js        # Sequelize associations among models
additional_functionalities/  # Slack bot and helpers
cronJobs.js           # Scheduled tasks
index.js              # Express app entrypoint and route mounting
```

## Environment Variables
The service reads configuration via `dotenv`:
- `DATABASE_NAME`, `UNAME`, `PASSWORD`: MySQL connection
- `JWT_SECRET_KEY`: JWT signing secret
- `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID` (optional): Slack notifications

## API Overview

Base URL: `http://localhost:4000`

### Auth (`/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate and receive JWT |
| POST | `/auth/register` | Create a new user |
| DELETE | `/auth/deleteuser/:id` | Delete user by id |
| PUT | `/auth/updateuser/:id` | Update user by id |
| GET | `/auth/authenticateadmin` | Token + role check (admin) |
| GET | `/auth/authenticateemployee` | Token + role check (employee) |
| GET | `/auth/authenticatecollector` | Token + role check (collector) |

### Users (`/user`)
| Method | Path | Description |
|---|---|---|
| GET | `/user/getallusers` | List users (excludes passwords) |
| GET | `/user/getuser/:id` | Get user detail |
| PUT | `/user/addbalance/:id/:ammount` | Add to user balance |
| PUT | `/user/subbalance/:id/:ammount` | Subtract from user balance |
| PUT | `/user/transferfrompool/:id/:ammount` | Transfer from pool to user |
| PUT | `/user/transfertopool/:id` | Settle purchases and transfer remainder to pool |
| GET | `/user/purchasecheck` | Check if purchase already settled |
| PUT | `/user/updatebyuser/:id` | Self-update allowed fields |
| GET | `/user/notifyusers` | Send Slack reminder (if configured) |
| GET | `/user/getallroles` | List roles |
| GET | `/user/getallpermissions` | List permissions |

### Core (`/core`)
Contributions
| Method | Path | Description |
|---|---|---|
| GET | `/core/getallcontributions` | List contributions |
| POST | `/core/addcontribution` | Add contribution (balances adjusted) |
| DELETE | `/core/deletecontribution/:id` | Delete contribution (balances adjusted) |
| GET | `/core/getnumparticipants` | Count participants |
| GET | `/core/gettotalbudget` | Total available budget (pool + contributions) |
| GET | `/core/getplatesneeded` | Computed plates needed |

Restaurants & Dishes
| Method | Path | Description |
|---|---|---|
| POST | `/core/addrestaurant` | Add restaurant |
| GET | `/core/getallrestaurants` | List restaurants |
| DELETE | `/core/deleterestaurant/:id` | Delete restaurant |
| POST | `/core/adddish` | Add dish |
| GET | `/core/getalldishes` | List dishes |
| GET | `/core/getdishesbyrestaurant` | Restaurants with dishes (excludes id 1) |
| GET | `/core/getbudgetdishes/:totalbudget` | Dishes affordable within half the budget |
| GET | `/core/finalizedishes/:platesneeded` | Finalize plan based on votes and plates |
| DELETE | `/core/deletedidh/:id` | Delete dish |

Voting
| Method | Path | Description |
|---|---|---|
| POST | `/core/addvote` | Cast vote (supports multiple dish ids) |
| GET | `/core/getnumvotes` | Count votes |
| GET | `/core/getallvotes` | List votes |
| DELETE | `/core/deletevote/:user_id` | Delete a user's vote |
| GET | `/core/votingresults` | Aggregated voting results |
| GET | `/core/gettotalroti` | Total roti calculation |
| GET | `/core/getvotebyuserid/:id` | Get vote id by user id |

Purchases & Billing
| Method | Path | Description |
|---|---|---|
| POST | `/core/addpurchase` | Bulk create purchases; validates budget and restaurant rules |
| GET | `/core/getallpurchases` | List purchases with dish names |
| DELETE | `/core/deletepurchase/:id` | Delete purchase |
| DELETE | `/core/deleteallpurchase` | Truncate purchases |
| GET | `/core/gettotalbill` | Total bill from purchases |

Balance Pool
| Method | Path | Description |
|---|---|---|
| GET | `/core/getbalancepool` | Get pool rows |
| PUT | `/core/addbalancepool/:ammount` | Increment pool total |
| PUT | `/core/subbalancepool/:ammount` | Decrement pool total |

Notes:
- Many endpoints expect/return JSON. See controllers for exact payloads.
- Some flows run in DB transactions to maintain consistency.

## Development
- Models are associated in `association.js`; the app calls `sequelize.sync({ force: false })` on start.
- CORS is open by default (`origin: '*'`). Adjust for production.
- Logging for Sequelize is disabled; re-enable as needed in `config/dbconnect.js`.

## License
This project is licensed under the terms of the `ISC` license. See `LICENSE` for details.

