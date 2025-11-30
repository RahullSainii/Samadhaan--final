# Samadhaan Backend API

Complete backend API for the Samadhaan Complaint Management System built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhaan
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

3. **Start MongoDB** (if using local MongoDB)
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

4. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── complaintController.js # Complaint CRUD operations
│   ├── profileController.js   # User profile management
│   └── statsController.js    # Statistics and analytics
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── adminMiddleware.js    # Admin role verification
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── User.js               # User schema
│   └── Complaint.js          # Complaint schema
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── complaintRoutes.js   # Complaint routes
│   ├── profileRoutes.js     # Profile routes
│   ├── statsRoutes.js       # Statistics routes
│   └── exportRoutes.js      # Export routes
├── utils/
│   └── csvExporter.js       # CSV export utility
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── server.js                 # Entry point
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Complaints
- `POST /api/complaints` - Submit new complaint (Protected)
- `GET /api/complaints` - Get all complaints (Admin) or user's complaints (User) (Protected)
- `GET /api/complaints/my` - Get logged-in user's complaints (Protected)
- `GET /api/complaints/:id` - Get complaint by ID (Protected)
- `PATCH /api/complaints/:id/status` - Update complaint status (Admin only)

### Profile
- `GET /api/profile/me` - Get user profile (Protected)
- `PUT /api/profile/update` - Update profile (Protected)
- `PUT /api/profile/change-password` - Change password (Protected)

### Statistics (Admin only)
- `GET /api/stats/total` - Total complaints count
- `GET /api/stats/pending` - Pending complaints count
- `GET /api/stats/resolved` - Resolved complaints count
- `GET /api/stats/category-distribution` - Category distribution for charts
- `GET /api/stats/status-distribution` - Status distribution for charts
- `GET /api/stats/all` - All statistics at once

### Export (Admin only)
- `GET /api/export/csv` - Export complaints to CSV

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request/Response Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "User"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User"
    }
  }
}
```

### Submit Complaint
```bash
POST /api/complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Technical",
  "description": "Login page not working properly",
  "priority": "High"
}
```

## 🧪 Testing with cURL

See `API_EXAMPLES.md` for complete cURL examples.

## 🚢 Deployment

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### Deploy to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy to Railway
1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repository
4. Add MongoDB service
5. Set environment variables
6. Deploy

### Deploy to Vercel
Note: Vercel is optimized for serverless. For Express apps, consider using Vercel's serverless functions or use Railway/Render instead.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS enabled
- Environment variables for sensitive data

## 📊 Database Models

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String: 'User' | 'Admin')
- phone (String, optional)
- address (String, optional)
- bio (String, optional)
- timestamps (createdAt, updatedAt)

### Complaint
- category (String: 'Technical' | 'Billing' | 'Service' | 'Infrastructure' | 'Other')
- description (String, required, min 10 chars)
- priority (String: 'Low' | 'Medium' | 'High')
- status (String: 'Pending' | 'In Progress' | 'Resolved')
- date (Date)
- userId (ObjectId, ref: User)
- timestamps (createdAt, updatedAt)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- Check network/firewall settings

### JWT Token Error
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration (30 days default)
- Ensure token is sent in Authorization header

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

## 📄 License

ISC

## 👥 Support

For issues or questions, please open an issue on GitHub.

