# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- A web browser

## 5-Minute Setup

### Step 1: Database Setup (2 minutes)
```sql
-- Login to MySQL
mysql -u root -p

-- Run the schema from your original project
source /path/to/database/schema.sql

-- Or create database manually
CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;
-- Then paste the table creation statements
```

### Step 2: Backend Setup (2 minutes)
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=your_mysql_password
# DB_NAME=inventory_system

# Start the backend server
npm start
```

Backend should now be running at `http://localhost:5000`

### Step 3: Frontend Setup (1 minute)
```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Start a simple HTTP server (choose one):

# Option A: Python 3
python3 -m http.server 3000

# Option B: Node.js http-server (install first: npm install -g http-server)
http-server -p 3000

# Option C: PHP
php -S localhost:3000
```

Frontend should now be running at `http://localhost:3000`

### Step 4: Create Admin User

Using the fix-login.js from your original project:
```bash
# From your original project directory
node fix-login.js
```

Or manually create user in MySQL:
```sql
USE inventory_system;
INSERT INTO users (username, email, password_hash, role) 
VALUES ('Admin', 'admin@ims.com', 'admin', 'admin');
```

### Step 5: Login

1. Open browser to `http://localhost:3000`
2. Login with:
   - Email: `admin@ims.com`
   - Password: `admin`

## Testing the API

You can test the API endpoints using curl or Postman:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.com","password":"admin"}'

# Get items (replace YOUR_TOKEN with the token from login)
curl http://localhost:5000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### Backend won't start
- Check if MySQL is running: `sudo service mysql status`
- Verify database credentials in `.env`
- Check if port 5000 is available: `lsof -i :5000`

### Frontend can't connect to backend
- Verify backend is running at `http://localhost:5000`
- Check CORS settings in backend
- Update `API_BASE_URL` in `frontend/js/config.js`

### Login fails
- Ensure admin user exists in database
- Check browser console for errors
- Verify backend logs for authentication errors

## Project URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

## Default Credentials

- Email: `admin@ims.com`
- Password: `admin`

**IMPORTANT**: Change this password in production!

## Next Steps

1. Add sample inventory items
2. Create a test sale
3. View reports
4. Create additional staff accounts
5. Customize the frontend styling

## File Structure Reference

```
frontend/
├── index.html          → Login page
├── dashboard.html      → Main dashboard
├── items.html          → Inventory management
├── new-sale.html       → Create sales
├── sales-list.html     → Sales history
├── css/
│   └── style.css       → Styles
└── js/
    ├── config.js       → API configuration
    ├── auth.js         → Login logic
    ├── dashboard.js    → Dashboard logic
    ├── items.js        → Items management
    ├── new-sale.js     → Sales creation
    └── sales-list.js   → Sales history

backend/
├── server.js           → Main server
├── config/
│   └── db.js          → Database connection
├── middleware/
│   └── auth.middleware.js → JWT auth
└── routes/
    ├── auth.routes.js     → Login/register
    ├── item.routes.js     → Items CRUD
    ├── sales.routes.js    → Sales management
    ├── dashboard.routes.js → Metrics
    └── report.routes.js   → Reports
```
