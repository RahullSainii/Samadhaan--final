# Deployment Guide

Complete guide for deploying Samadhaan Backend to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended)

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing the backend

3. **Configure Service**
   ```
   Name: samadhaan-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key_min_32_chars
     NODE_ENV=production
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)
   - Your API will be available at: `https://your-app-name.onrender.com/api`

### Option 2: Railway

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MongoDB**
   - Click "New" → "Database" → "MongoDB"
   - Railway will automatically create a MongoDB instance
   - Copy the connection string

4. **Set Environment Variables**
   - Go to "Variables" tab
   - Add:
     ```
     PORT=5000
     MONGO_URI=<railway_mongodb_connection_string>
     JWT_SECRET=your_super_secret_jwt_key_min_32_chars
     NODE_ENV=production
     ```

5. **Deploy**
   - Railway auto-deploys on push
   - Your API will be available at: `https://your-app-name.up.railway.app/api`

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create samadhaan-backend
   ```

4. **Add MongoDB**
   - Install MongoDB Atlas or use Heroku addon:
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your_mongodb_connection_string
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create Account**
   - Go to [digitalocean.com](https://www.digitalocean.com)

2. **Create App**
   - Click "Create" → "Apps"
   - Connect GitHub repository

3. **Configure**
   - Select Node.js environment
   - Build command: `npm install`
   - Run command: `npm start`

4. **Add Database**
   - Add MongoDB managed database
   - Copy connection string

5. **Set Environment Variables**
   - Add all required variables in settings

6. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

## 🗄️ MongoDB Atlas Setup

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `samadhaan-user`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `samadhaan` (optional)

   Example:
   ```
   mongodb+srv://samadhaan-user:yourpassword@cluster0.xxxxx.mongodb.net/samadhaan?retryWrites=true&w=majority
   ```

6. **Update Environment Variable**
   - Use this connection string as `MONGO_URI` in your deployment platform

## 🔐 Security Checklist

- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable HTTPS (most platforms do this automatically)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable CORS only for your frontend domain
- [ ] Set up rate limiting (optional, for production)
- [ ] Enable MongoDB authentication
- [ ] Regular backups of database

## 🌐 Frontend Integration

After deploying, update your frontend `script.js`:

```javascript
// For production
const API_BASE_URL = 'https://your-backend-url.com/api';

// For development
// const API_BASE_URL = 'http://localhost:5000/api';
```

## 📊 Monitoring

### Health Check Endpoint
```
GET https://your-backend-url.com/api/health
```

### Logs
- **Render**: Dashboard → Your Service → Logs
- **Railway**: Dashboard → Your Service → Deployments → View Logs
- **Heroku**: `heroku logs --tail`

## 🔄 Continuous Deployment

All platforms support automatic deployment on git push:

1. Push to main/master branch
2. Platform detects changes
3. Automatically builds and deploys
4. Service restarts with new code

## 🐛 Troubleshooting

### Deployment Fails

1. **Check Build Logs**
   - Look for npm install errors
   - Verify Node.js version compatibility

2. **Check Environment Variables**
   - Ensure all required variables are set
   - Verify MongoDB connection string format

3. **Check MongoDB Connection**
   - Verify IP whitelist includes platform IPs
   - Check database user credentials

### Application Crashes

1. **Check Application Logs**
   - Look for error messages
   - Verify environment variables

2. **Test Locally**
   - Run `npm install`
   - Set environment variables
   - Run `npm start`
   - Test endpoints

### CORS Errors

Update `server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your_secret_key_here` |
| `NODE_ENV` | Environment mode | `production` or `development` |

## 🎯 Production Best Practices

1. **Use Environment Variables**
   - Never hardcode secrets
   - Use platform's environment variable system

2. **Enable HTTPS**
   - Most platforms do this automatically
   - Update frontend to use HTTPS URLs

3. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Set up regular backup schedule

4. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Set up alerts for downtime

5. **Rate Limiting**
   - Consider adding rate limiting middleware
   - Protect against abuse

6. **Logging**
   - Use proper logging library (Winston, etc.)
   - Log errors and important events

## 🚀 Quick Start Commands

```bash
# Local development
npm install
cp .env.example .env
# Edit .env with your values
npm start

# Production build (if needed)
npm install --production
NODE_ENV=production npm start
```

## 📞 Support

For deployment issues:
1. Check platform documentation
2. Review application logs
3. Test locally first
4. Verify environment variables

