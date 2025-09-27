// Script to set up database indexes for optimal search performance
// Run this once: node scripts/setup-indexes.js

import { createSearchIndexes } from '../src/lib/mongodb.js'

async function main() {
  console.log('Setting up database indexes for search optimization...')
  
  try {
    const success = await createSearchIndexes()
    if (success) {
      console.log('✅ Database indexes created successfully!')
      console.log('Your search should now be much faster.')
    } else {
      console.log('❌ Failed to create some indexes. Check the logs above.')
    }
  } catch (error) {
    console.error('❌ Error setting up indexes:', error)
  }
  
  process.exit(0)
}

main()