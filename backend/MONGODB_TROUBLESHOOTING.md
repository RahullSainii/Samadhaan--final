# MongoDB Connection Troubleshooting Guide

## 🔴 SSL/TLS Error: "ssl3_read_bytes:tlsv1 alert internal error"

This error typically occurs when connecting to MongoDB Atlas. Here are solutions:

### Solution 1: Check IP Whitelist (Most Common Fix)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** in the left sidebar
3. Click **Add IP Address**
4. For testing: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ **Warning**: Only for development! Use specific IPs in production
5. Click **Confirm**
6. Wait 1-2 minutes for changes to propagate
7. Restart your backend server

### Solution 2: Verify Connection String

Your `.env` file should have:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Check:**
- ✅ No line breaks or spaces in the connection string
- ✅ Username and password are correct
- ✅ Database name is correct
- ✅ Cluster URL is correct

### Solution 3: Regenerate Connection String

1. Go to MongoDB Atlas → **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** and version **4.1 or later**
4. Copy the new connection string
5. Replace the `MONGO_URI` in your `.env` file
6. Make sure to replace `<password>` with your actual password

### Solution 4: Update Node.js

MongoDB Atlas requires Node.js 14 or higher.

Check your version:
```bash
node --version
```

Update if needed:
- Download from [nodejs.org](https://nodejs.org/)
- Or use nvm: `nvm install --lts`

### Solution 5: Network/Firewall Issues

- Check if your network/firewall blocks MongoDB connections
- Try from a different network (mobile hotspot, etc.)
- Check corporate firewall settings if on company network

### Solution 6: Test Connection Manually

Test if you can reach MongoDB Atlas:

```bash
# Test DNS resolution
nslookup samadhaan.zbulfbg.mongodb.net

# Test connection (if you have mongosh installed)
mongosh "mongodb+srv://rs845263_db_user:rahul007@samadhaan.zbulfbg.mongodb.net/samadhaan"
```

## 🔍 Other Common Errors

### Authentication Failed
- Check username/password in connection string
- Verify database user exists in MongoDB Atlas
- Check user has read/write permissions

### ENOTFOUND / DNS Error
- Check internet connection
- Verify cluster is running in MongoDB Atlas
- Check DNS resolution

### Connection Timeout
- Check IP whitelist
- Check network connectivity
- Increase timeout in connection options

## ✅ Quick Checklist

- [ ] IP address whitelisted in MongoDB Atlas
- [ ] Connection string has no spaces/line breaks
- [ ] Username and password are correct
- [ ] Node.js version is 14+
- [ ] Internet connection is working
- [ ] MongoDB Atlas cluster is running
- [ ] Database user has correct permissions

## 🆘 Still Not Working?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com/
2. **Check Backend Logs**: Look for detailed error messages
3. **Test with MongoDB Compass**: Try connecting with MongoDB Compass GUI
4. **Contact Support**: MongoDB Atlas has 24/7 support

## 📝 Example Working Connection String

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/samadhaan?retryWrites=true&w=majority
```

**Important**: 
- Replace `username` with your MongoDB username
- Replace `password` with your MongoDB password
- Replace `cluster0.xxxxx.mongodb.net` with your cluster URL
- Keep `?retryWrites=true&w=majority` at the end

