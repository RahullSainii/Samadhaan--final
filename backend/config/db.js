const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Clean the connection string (remove any whitespace/newlines)
    let mongoURI = process.env.MONGO_URI.trim().replace(/\s+/g, '');
    
    // For MongoDB Atlas, ensure proper SSL handling
    // Add connection options for better SSL/TLS handling
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('ssl3_read_bytes') || error.message.includes('alert internal error')) {
      console.error('\n💡 SSL/TLS Connection Error Detected!');
      console.error('\n🔧 Try these solutions in order:');
      console.error('   1. Check MongoDB Atlas IP Whitelist:');
      console.error('      - Go to MongoDB Atlas → Network Access');
      console.error('      - Add your current IP or 0.0.0.0/0 (for testing only)');
      console.error('   2. Verify Connection String:');
      console.error('      - Check username/password are correct');
      console.error('      - Ensure no extra spaces or line breaks');
      console.error('   3. Network/Firewall:');
      console.error('      - Check if your network blocks MongoDB connections');
      console.error('      - Try from a different network');
      console.error('   4. Update Node.js:');
      console.error('      - MongoDB Atlas requires Node.js 14+');
      console.error('      - Current version:', process.version);
      console.error('   5. Regenerate Connection String:');
      console.error('      - MongoDB Atlas → Database → Connect → Drivers');
      console.error('      - Copy the new connection string');
      console.error('\n📝 Connection string format:');
      console.error('   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication Error:');
      console.error('   - Check your MongoDB Atlas username and password');
      console.error('   - Verify database user has correct permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 Network/DNS Error:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check DNS resolution');
    }
    
    console.error('\n⚠️  Server will continue running but database operations will fail.');
    console.error('   Fix the connection and restart the server.\n');
    
    // Don't exit - allow server to start (for development)
    // In production, you might want to exit
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

