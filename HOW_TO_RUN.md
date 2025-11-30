# 🚀 How to Run Samadhaan

Complete guide to run both backend and frontend.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm (comes with Node.js)

## 🔧 Step-by-Step Setup

### Step 1: Start Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: ...
🚀 Samadhaan Backend Server running on port 5000
📡 API Base URL: http://localhost:5000/api
```

**Keep this terminal open!**

### Step 2: Start Frontend (New Terminal)

Open a **new terminal window** and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start the frontend server
npm start
```

**Expected Output:**
```
Starting up http-server, serving .
Available on:
  http://127.0.0.1:8000
  http://localhost:8000
Hit CTRL-C to stop the server
```

The browser should automatically open to `http://localhost:8000/index.html`

## 🎯 Quick Start Commands

### Terminal 1 (Backend):
```bash
cd backend
npm start
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## ✅ Verify Everything is Working

1. **Backend Health Check**: Open `http://localhost:5000/api/health`
   - Should show: `{"status":"OK","message":"Samadhaan API is running"}`

2. **Frontend**: Should open automatically at `http://localhost:8000/index.html`

3. **Test Flow**:
   - Register a new user
   - Login
   - Submit a complaint
   - View complaints

## 🔍 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check MongoDB is running (if local)
- Verify `.env` file has correct `MONGO_URI`
- Check IP whitelist in MongoDB Atlas
- See `backend/MONGODB_TROUBLESHOOTING.md`

**Port 5000 already in use:**
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Update `API_BASE_URL` in `frontend/script.js`

### Frontend Issues

**Port 8000 already in use:**
- Change port in `frontend/package.json`:
  ```json
  "start": "npx http-server . -p 3000 -o"
  ```

**CORS Errors:**
- Make sure you're using a local server (not opening file://)
- Check backend CORS is enabled
- Verify backend is running

**API Connection Errors:**
- Check backend is running: `http://localhost:5000/api/health`
- Verify `API_BASE_URL` in `frontend/script.js` matches backend port
- Check browser console for detailed errors

## 📊 Ports Used

- **Backend**: `5000` (configurable in `backend/.env`)
- **Frontend**: `8000` (configurable in `frontend/package.json`)

## 🎨 Alternative Frontend Methods

If `npm start` doesn't work, try:

### Python:
```bash
cd frontend
python -m http.server 8000
```

### VS Code Live Server:
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Direct Open (Not Recommended):
- Just open `index.html` in browser
- ⚠️ Some features may not work due to CORS

## 🔄 Development Workflow

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```

3. **Make Changes**
   - Edit frontend files → Refresh browser
   - Edit backend files → Restart backend (Ctrl+C, then `npm start`)

4. **Test Features**
   - Register/Login
   - Submit complaints
   - View dashboards

## 📝 Environment Variables

### Backend (`.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (`script.js`):
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## ✅ Checklist

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] MongoDB connected (check backend logs)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 8000
- [ ] Browser opens automatically
- [ ] Can register/login
- [ ] Can submit complaints

## 🆘 Still Having Issues?

1. Check both terminals for error messages
2. Verify MongoDB connection
3. Check browser console (F12) for errors
4. Verify ports are not in use
5. Check firewall/antivirus settings

Your application should now be running! 🎉

