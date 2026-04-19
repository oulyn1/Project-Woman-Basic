# Project-Woman-Basic

Project-Woman-Basic is a comprehensive E-commerce solution tailored for the fashion industry. The project aims to enhance the user experience for the **Woman Basic** fashion shop through system optimization, performance improvements, and modern UI/UX design.

---

## 🚀 Key Features

### 👤 Customer Portal
- **Home & Shopping**: Browse products with dynamic filtering and sorting.
- **Cart & Checkout**: Seamless shopping experience with persistent cart management.
- **Account Management**: Profile personalization and order tracking.
- **Product Reviews**: View and submit ratings for purchased items.

### 🛡️ Admin Dashboard
- **Product & Category**: Full CRUD management for the inventory.
- **Order Management**: Track and manage customer orders.
- **Account Control**: Manage system users and roles.
- **Promotions**: Create and manage discount campaigns.
- **Ratings Oversight**: Monitor and moderate customer feedback.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (v19)
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router (v7)
- **Icons**: Material Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (using MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Utilities**: Joi (Validation), Bcrypt (Password hashing), Nodemailer.

---

## 📂 Project Structure

This project is organized as a **Monorepo** for easier management of both client and server code.

```text
Project-Woman-Basic/
├── backend/                # Express.js Server
│   ├── src/
│   │   ├── config/         # App configurations (DB, Environment)
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints (v1, v2)
│   │   ├── services/       # Business logic
│   │   └── server.js       # Entry point
├── frontend/               # React Application
│   ├── src/
│   │   ├── apis/           # API service layers
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Layout wrappers (Admin, Customer)
│   │   ├── pages/          # Individual screen components
│   │   └── main.jsx        # Entry point
├── package.json            # Root configuration (Workspaces)
└── README.md               # You are here!
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v7.x or higher
- **MongoDB**: Access to a MongoDB database (Local or Atlas)

### 2. Environment Configuration

#### Backend
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=WomanBasic
APP_HOST=localhost
APP_PORT=8017
JWT_SECRET=your_secret_key
```

#### Frontend
API connection is configured in `frontend/src/util/constants.js`:
```javascript
export const API_ROOT = 'http://localhost:8017'
```

### 3. Installation
From the **root directory**, run the following to install dependencies for both Frontend and Backend:
```bash
npm install
```

### 4. Running the Development Server
To start both applications simultaneously:
```bash
npm run dev
```

---

## 🛠 Project Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both Frontend and Backend in development mode. |
| `npm run backend` | Runs only the Express server. |
| `npm run frontend` | Runs only the React/Vite development server. |
| `npm install` | Installs dependencies for the entire project. |

---

## 📝 License
This project is for internal use. All rights reserved.
