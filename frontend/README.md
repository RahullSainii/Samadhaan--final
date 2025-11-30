# Samadhaan Frontend

Static frontend for the Samadhaan Complaint Management System.

## 🚀 How to Run

### Option 1: Using npm (Recommended)

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   
   This will:
   - Start a local server on port 8000
   - Automatically open your browser
   - Serve the frontend files

### Option 2: Using Python (No installation needed)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000/index.html`

### Option 3: Using Node.js http-server (Global)

```bash
# Install globally (one time)
npm install -g http-server

# Run
cd frontend
http-server -p 8000 -o
```

### Option 4: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 5: Open Directly (Not Recommended)

Simply open `index.html` in your browser, but:
- ⚠️ Some features may not work due to CORS restrictions
- ⚠️ API calls might fail

## 📁 File Structure

```
frontend/
├── index.html          # Homepage with login/register
├── user_dashboard.html # User dashboard
├── admin_dashboard.html # Admin dashboard
├── profile.html        # User profile page
├── script.js           # JavaScript (connected to backend)
├── style.css           # Styles
├── images.jpeg         # Logo
└── package.json        # npm configuration
```

## 🔌 Backend Connection

The frontend is configured to connect to:
- **Development**: `http://localhost:5000/api`
- **Production**: Update `API_BASE_URL` in `script.js`

## ✅ Prerequisites

1. **Backend must be running** on port 5000
   ```bash
   cd ../backend
   npm start
   ```

2. **MongoDB** must be connected (for backend)

## 🧪 Testing

1. Start backend: `cd ../backend && npm start`
2. Start frontend: `npm start` (in frontend folder)
3. Open browser: `http://localhost:8000/index.html`
4. Register a new user
5. Login and test features

## 🐛 Troubleshooting

### Port 8000 already in use
Change the port in `package.json`:
```json
"start": "npx http-server . -p 3000 -o"
```

### CORS errors
- Make sure you're using a local server (not opening file://)
- Check backend CORS is enabled
- Verify backend is running

### API connection errors
- Check backend is running on port 5000
- Verify `API_BASE_URL` in `script.js`
- Check browser console for errors

## 📝 Notes

- Frontend is static HTML/CSS/JS (no build process needed)
- All API calls are made via `fetch()` to the backend
- JWT tokens are stored in localStorage
- No backend dependencies required for frontend
