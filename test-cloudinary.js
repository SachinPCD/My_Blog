// Quick Cloudinary Test
// Run this in Node.js to test your Cloudinary setup

const { v2: cloudinary } = require('cloudinary');

// Your credentials
cloudinary.config({
  cloud_name: 'dizfgwddr',
  api_key: '886513277679353',
  api_secret: 'N7ESwTLMUtEtZuBc9-768nqkVp8'
});

// Test connection
async function testCloudinary() {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!', result);
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
  }
}

testCloudinary();