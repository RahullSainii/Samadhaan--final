# 🔌 Frontend-Backend Connection Guide

## ✅ What I've Done

I've updated your `frontend/script.js` to connect to the backend API. All functions now use `fetch()` to communicate with your backend.

## 🚀 Quick Start

### Step 1: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Samadhaan Backend Server running on port 5000
📡 API Base URL: http://localhost:5000/api
```

### Step 2: Open Frontend

Open `frontend/index.html` in your browser (or use a local server).

### Step 3: Test Connection

1. **Register a new user** - This will create an account and get a JWT token
2. **Login** - Verify authentication works
3. **Submit a complaint** - Test data submission
4. **View complaints** - Verify data loading

## 🔧 Configuration

The API base URL is set in `frontend/script.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**For production**, change this to your deployed backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## ✅ Updated Functions

All these functions now connect to the backend:

- ✅ `handleLogin()` - Authenticates with backend
- ✅ `handleRegister()` - Creates user account
- ✅ `handleComplaintSubmission()` - Submits complaints to backend
- ✅ `loadComplaints()` - Fetches user's complaints
- ✅ `loadAdminComplaints()` - Fetches all complaints (admin)
- ✅ `updateStatus()` - Updates complaint status (admin)
- ✅ `updateStatistics()` - Fetches stats from backend
- ✅ `initializeCharts()` - Loads chart data from backend
- ✅ `exportToCSV()` - Downloads CSV from backend
- ✅ `loadProfile()` - Loads user profile
- ✅ `filterComplaints()` - Filters with backend API
- ✅ `filterAdminComplaints()` - Admin filtering with backend

## 🔍 Troubleshooting

### Backend Not Running

**Error**: `Network error. Please check if backend is running.`

**Solution**:
1. Check if backend is running: `cd backend && npm start`
2. Verify MongoDB is connected
3. Check `.env` file has correct `MONGO_URI`

### CORS Error

**Error**: `Access to fetch at 'http://localhost:5000/api' from origin 'file://' has been blocked by CORS policy`

**Solution**:
- Don't open HTML files directly (file://)
- Use a local server instead:
  ```bash
  # Option 1: Python
  cd frontend
  python -m http.server 8000
  
  # Option 2: Node.js (http-server)
  npx http-server frontend -p 8000
  
  # Option 3: VS Code Live Server extension
  ```
- Then open: `http://localhost:8000/index.html`

### Authentication Error

**Error**: `Token is not valid` or `No token provided`

**Solution**:
1. Make sure you're logged in
2. Check browser console for errors
3. Clear localStorage and login again:
   ```javascript
   localStorage.clear();
   ```

### MongoDB Connection Error

**Error**: `MongoDB Connection Error`

**Solution**:
1. Check MongoDB is running (if local)
2. Verify `MONGO_URI` in `.env` is correct
3. For MongoDB Atlas, check IP whitelist

## 🧪 Testing the Connection

### Test 1: Health Check

Open in browser: `http://localhost:5000/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Samadhaan API is running"
}
```

### Test 2: Register User

1. Open frontend
2. Fill registration form
3. Click Register
4. Check browser console for success/errors
5. Check Network tab in DevTools

### Test 3: Login

1. Use registered email/password
2. Select correct role
3. Click Login
4. Should redirect to dashboard
5. Token should be stored in localStorage

## 📊 Browser DevTools

Open DevTools (F12) to debug:

1. **Console Tab** - See JavaScript errors
2. **Network Tab** - See API requests/responses
3. **Application Tab** - See localStorage (token storage)

## 🔐 Token Storage

The JWT token is stored in `localStorage`:
- Key: `token`
- Key: `user` (user data)

To clear:
```javascript
localStorage.clear();
```

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Frontend is updated
3. ✅ Test registration
4. ✅ Test login
5. ✅ Test complaint submission
6. ✅ Test admin features

## 💡 Tips

- Always check browser console for errors
- Use Network tab to see API calls
- Verify token is stored after login
- Check backend logs for server-side errors

## 🆘 Still Having Issues?

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify MongoDB connection
4. Test API endpoints with Postman
5. Check CORS configuration

Your frontend is now fully connected to the backend! 🎉


