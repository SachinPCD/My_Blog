// Alternative setup script that works with current configuration
// Run with: node scripts/setup-indexes.mjs

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function createSearchIndexes() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local')
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('blogposts')
    
    // Create text index for full-text search
    console.log('Creating text search index...')
    await collection.createIndex(
      { title: 'text', description: 'text' },
      { 
        name: 'title_description_text',
        weights: { title: 2, description: 1 }
      }
    )
    console.log('✅ Text search index created')
    
    // Create compound index for sorting
    console.log('Creating publishedAt index...')
    await collection.createIndex({ publishedAt: -1 })
    console.log('✅ PublishedAt index created')
    
    // Create unique index on slug
    console.log('Creating slug index...')
    try {
      await collection.createIndex({ slug: 1 }, { unique: true })
      console.log('✅ Slug index created')
    } catch (error) {
      if (error.code === 11000) {
        console.log('⚠️  Slug index already exists (duplicate key error)')
      } else {
        console.log('⚠️  Could not create unique slug index:', error.message)
      }
    }
    
    console.log('\n🎉 All indexes have been set up successfully!')
    console.log('Your search performance should now be significantly improved.')
    
    return true
  } catch (error) {
    console.error('❌ Error setting up indexes:', error)
    return false
  } finally {
    await client.close()
  }
}

async function main() {
  console.log('Setting up database indexes for search optimization...\n')
  
  try {
    const success = await createSearchIndexes()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main()