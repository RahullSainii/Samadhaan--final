// Quick test script to verify backend is running
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Backend is running correctly!');
      process.exit(0);
    } else {
      console.log('❌ Backend returned an error');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to backend:', error.message);
  console.log('Make sure the backend server is running: npm start');
  process.exit(1);
});

req.end();

