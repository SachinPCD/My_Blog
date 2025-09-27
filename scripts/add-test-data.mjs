// Test script to add sample blog posts for testing smart search
// Run with: node scripts/add-test-data.mjs

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const samplePosts = [
  {
    title: "Optimize Your Database Performance",
    description: "Learn how to optimize database queries and improve performance in production applications.",
    content: "Database optimization is crucial for application performance...",
    slug: "optimize-database-performance",
    publishedAt: new Date('2024-01-15')
  },
  {
    title: "Orange Theory: Color Psychology in Web Design",
    description: "Explore how orange and other colors impact user behavior and engagement.",
    content: "Color psychology plays a vital role in web design...",
    slug: "orange-theory-color-psychology",
    publishedAt: new Date('2024-01-20')
  },
  {
    title: "Organic SEO Strategies",
    description: "Discover organic search engine optimization techniques that work.",
    content: "Organic SEO is about creating valuable content...",
    slug: "organic-seo-strategies",
    publishedAt: new Date('2024-01-25')
  },
  {
    title: "JavaScript Optimization Techniques",
    description: "Master advanced JavaScript optimization for better performance.",
    content: "JavaScript optimization involves several techniques...",
    slug: "javascript-optimization",
    publishedAt: new Date('2024-02-01')
  },
  {
    title: "React Performance Best Practices",
    description: "Optimize React applications for maximum performance and user experience.",
    content: "React performance optimization is essential...",
    slug: "react-performance-practices",
    publishedAt: new Date('2024-02-05')
  },
  {
    title: "Understanding Oracle Database",
    description: "A comprehensive guide to Oracle database management and optimization.",
    content: "Oracle database is one of the most powerful...",
    slug: "oracle-database-guide",
    publishedAt: new Date('2024-02-10')
  },
  {
    title: "Mobile App Optimization",
    description: "Techniques for optimizing mobile applications across different platforms.",
    content: "Mobile optimization requires specific considerations...",
    slug: "mobile-app-optimization",
    publishedAt: new Date('2024-02-15')
  },
  {
    title: "Order Management Systems",
    description: "Building efficient order management systems for e-commerce.",
    content: "Order management is critical for e-commerce success...",
    slug: "order-management-systems",
    publishedAt: new Date('2024-02-20')
  }
]

async function addTestData() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local')
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('blogposts')
    
    // Check if data already exists
    const existingCount = await collection.countDocuments()
    console.log(`Found ${existingCount} existing posts`)
    
    if (existingCount === 0) {
      console.log('Adding sample blog posts...')
      const result = await collection.insertMany(samplePosts)
      console.log(`✅ Added ${result.insertedCount} sample posts`)
    } else {
      console.log('Sample data already exists, skipping insertion')
      
      // Optionally update existing posts to ensure they have good test data
      console.log('Updating existing posts with better test data...')
      for (let i = 0; i < Math.min(samplePosts.length, existingCount); i++) {
        await collection.updateOne(
          {}, // Update the first few posts
          { $set: samplePosts[i] }
        )
      }
      console.log('✅ Updated existing posts with test data')
    }
    
    console.log('\n🎉 Test data is ready!')
    console.log('\nTry searching for:')
    console.log('- "O" (should show Orange, Organic, Oracle, Order, Optimize)')
    console.log('- "Or" (should show Orange, Organic, Oracle, Order)')
    console.log('- "Opt" (should show Optimize, Optimization posts)')
    console.log('- "React" (should show React posts first)')
    
  } catch (error) {
    console.error('❌ Error adding test data:', error)
  } finally {
    await client.close()
  }
}

addTestData()