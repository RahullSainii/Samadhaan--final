# 🚀 Quick Start Guide

Get your Samadhaan backend up and running in 5 minutes!

## Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- MongoDB (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Create a `.env` file in the `backend` folder:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhaan
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**For MongoDB Atlas**, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/samadhaan?retryWrites=true&w=majority
```

## Step 3: Start MongoDB

### Local MongoDB:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### MongoDB Atlas:
- No local setup needed!
- Just use your Atlas connection string in `.env`

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Samadhaan Backend Server running on port 5000
📡 API Base URL: http://localhost:5000/api
```

## Step 5: Test the API

### Option 1: Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "User"
  }'
```

### Option 2: Using Postman

1. Import `Samadhaan_API.postman_collection.json`
2. Set `base_url` variable to `http://localhost:5000/api`
3. Start testing!

### Option 3: Using Browser

Open: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "Samadhaan API is running"
}
```

## 🎯 Next Steps

1. **Test Authentication**
   - Register a user
   - Login and get token
   - Use token for protected routes

2. **Test Complaints**
   - Submit a complaint
   - Get your complaints
   - Update status (as admin)

3. **Connect Frontend**
   - See `FRONTEND_INTEGRATION.md`
   - Update `API_BASE_URL` in `script.js`
   - Test full flow

4. **Deploy**
   - See `DEPLOYMENT.md`
   - Choose a platform (Render, Railway, etc.)
   - Deploy and enjoy!

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env to another port (e.g., 5001)
PORT=5001
```

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- For Atlas: Check IP whitelist

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📚 Documentation

- **API Examples**: See `API_EXAMPLES.md`
- **Frontend Integration**: See `FRONTEND_INTEGRATION.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Full README**: See `README.md`

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running or Atlas configured
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Can register/login
- [ ] Can submit complaints

## 🎉 You're Ready!

Your backend is now running. Connect your frontend and start building!

For help, check the documentation files or open an issue.

