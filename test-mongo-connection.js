const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...');
  console.log('🌐 URI:', process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('⏱️ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('Blogs_App');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    try {
      await client.close();
      console.log('🔌 Connection closed');
    } catch (closeError) {
      console.error('❌ Error closing connection:', closeError.message);
    }
  }
}

testConnection();