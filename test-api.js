require('dotenv').config({ path: '.env.local' });
const { getPostsWithTextSearch } = require('./src/lib/mongodb');

async function testAPI() {
  console.log('🧪 Testing API functionality...');
  
  try {
    console.log('📝 Fetching posts...');
    const posts = await getPostsWithTextSearch('');
    console.log('✅ Posts fetched successfully!');
    console.log(`📊 Total posts: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('📋 Sample post:', {
        title: posts[0].title,
        author: posts[0].author,
        createdAt: posts[0].createdAt
      });
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();