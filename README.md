# Inventory Management System - Restructured

This is a complete restructure of the Inventory Management System with separated frontend (HTML/CSS/JS) and backend (Node.js REST API).

## Project Structure

```
inventory-system-restructured/
├── backend/                    # Node.js REST API
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   └── auth.middleware.js # JWT authentication
│   ├── routes/
│   │   ├── auth.routes.js     # Authentication endpoints
│   │   ├── item.routes.js     # Item CRUD endpoints
│   │   ├── sales.routes.js    # Sales endpoints
│   │   ├── dashboard.routes.js # Dashboard metrics
│   │   └── report.routes.js   # Reports & CSV export
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Main server file
│
└── frontend/                   # Static HTML/CSS/JS
    ├── css/
    │   └── style.css          # Main stylesheet
    ├── js/
    │   ├── config.js          # API configuration
    │   ├── utils.js           # Utility functions
    │   ├── components.js      # Reusable UI components
    │   ├── auth.js            # Login functionality
    │   ├── dashboard.js       # Dashboard page
    │   └── items.js           # Items page
    ├── index.html             # Login page
    ├── dashboard.html         # Dashboard
    └── items.html             # Inventory items
```

## Features

### Backend API
- **JWT Authentication** - Token-based authentication
- **RESTful API** - Clean API endpoints
- **CORS Support** - Cross-origin resource sharing
- **MySQL Database** - Relational database
- **CSV Export** - Sales report export

### Frontend
- **Vanilla JavaScript** - No frameworks required
- **Bootstrap 5** - Responsive UI
- **Token Storage** - LocalStorage for session
- **Dynamic Components** - Reusable sidebar/header
- **Modal Forms** - Add/Edit items

## Setup Instructions

### 1. Database Setup

Run the existing schema.sql file from the original project:

```sql
-- Use the database/schema.sql file from your original project
CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;
-- Then run the rest of the schema
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials
nano .env

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

The frontend is pure HTML/CSS/JS and needs a simple web server:

**Option 1: Using Python**
```bash
cd frontend
python3 -m http.server 3000
```

**Option 2: Using Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

**Option 3: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click on index.html
- Select "Open with Live Server"

The frontend will run on `http://localhost:3000`

### 4. Create Admin User

Run one of these scripts from the original project to create an admin user:

```bash
node fix-login.js
# OR
node create_user.js
```

Default credentials:
- Email: `admin@ims.com`
- Password: `admin`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new staff (requires auth)
- `GET /api/auth/verify` - Verify token

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale with items
- `POST /api/sales` - Create new sale

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard data

### Reports
- `GET /api/reports` - Get sales report data
- `GET /api/reports/export?filter=daily|monthly` - Export CSV

## Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=inventory_system
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (js/config.js)
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Authentication Flow

1. User logs in at `index.html`
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage
4. All subsequent API calls include token in Authorization header
5. Backend middleware validates token
6. Logout removes token from localStorage

## Key Differences from Original

### Before (EJS)
- Server-side rendering
- Session-based authentication
- Tightly coupled frontend/backend
- Template engine (EJS)

### After (HTML/CSS/JS)
- Client-side rendering
- Token-based authentication (JWT)
- Decoupled frontend/backend
- Pure HTML/CSS/JavaScript
- RESTful API architecture

## Development Tips

1. **CORS**: Make sure backend CORS is configured to allow frontend URL
2. **Tokens**: Tokens expire in 24 hours by default
3. **API URL**: Update `API_BASE_URL` in `frontend/js/config.js` if deploying
4. **Database**: Keep the same database schema from original project

## Deployment

### Backend
- Deploy to Heroku, DigitalOcean, AWS, etc.
- Set environment variables
- Use production database

### Frontend
- Deploy to Netlify, Vercel, GitHub Pages, etc.
- Update API_BASE_URL to production backend URL
- No build step required (static files)

## Security Considerations

1. Change JWT_SECRET in production
2. Use HTTPS in production
3. Implement rate limiting
4. Add input validation
5. Use environment variables for sensitive data

## Next Steps (Additional Pages to Create)

- `new-sale.html` - Create new sale
- `sales-list.html` - View sales history
- `reports.html` - Sales reports and analytics
- `register.html` - Register new staff
- `receipt.html` - Print receipt

## Support

For issues or questions, refer to:
- Backend logs: Check console output
- Frontend errors: Check browser console (F12)
- Network issues: Check browser Network tab
