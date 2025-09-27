// lib/mongodb.js
import { MongoClient } from 'mongodb'

let client
let db

export async function connectDB() {
  if (!client) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env')
    }
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  if (!db) throw new Error('Failed to connect to DB')
  return db
}

// Convert MongoDB types to plain objects
function formatDate(date) {
  if (!date) return null
  return date instanceof Date ? date.toISOString() : date.toString()
}

// Smart search with relevance ranking
export async function getPosts(search = '') {
  const db = await connectDB()
  
  if (!search || !search.trim()) {
    // Return all posts sorted by date when no search term
    try {
      const posts = await db
        .collection('blogposts')
        .find({})
        .sort({ publishedAt: -1 })
        .limit(100)
        .toArray()

      return posts.map(post => ({
        _id: post._id.toString(),
        title: post.title || '',
        description: post.description || '',
        slug: post.slug || '',
        publishedAt: formatDate(post.publishedAt),
        relevanceScore: 0
      }))
    } catch (error) {
      console.error('Error fetching all posts:', error)
      throw new Error('Failed to fetch posts from database')
    }
  }

  const searchTerm = search.trim()
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  try {
    // Create multiple search patterns with different priorities
    const aggregationPipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: escapedTerm, $options: 'i' } },
            { description: { $regex: escapedTerm, $options: 'i' } }
          ]
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // HIGHEST: Exact title match (score: 1000)
              {
                $cond: [
                  { $eq: [{ $toLower: '$title' }, searchTerm.toLowerCase()] },
                  1000,
                  0
                ]
              },
              // VERY HIGH: Title starts with search term (score: 500)
              {
                $cond: [
                  { $regexMatch: { input: '$title', regex: `^${escapedTerm}`, options: 'i' } },
                  500,
                  0
                ]
              },
              // HIGH: Any word in title starts with search term (score: 300)
              {
                $cond: [
                  { $regexMatch: { input: '$title', regex: `\\b${escapedTerm}`, options: 'i' } },
                  300,
                  0
                ]
              },
              // MEDIUM-HIGH: Title contains search term anywhere (score: 200)
              {
                $cond: [
                  { $regexMatch: { input: '$title', regex: escapedTerm, options: 'i' } },
                  200,
                  0
                ]
              },
              // MEDIUM: Description starts with search term (score: 100)
              {
                $cond: [
                  { $regexMatch: { input: '$description', regex: `^${escapedTerm}`, options: 'i' } },
                  100,
                  0
                ]
              },
              // MEDIUM-LOW: Any word in description starts with search term (score: 80)
              {
                $cond: [
                  { $regexMatch: { input: '$description', regex: `\\b${escapedTerm}`, options: 'i' } },
                  80,
                  0
                ]
              },
              // LOW: Description contains search term anywhere (score: 50)
              {
                $cond: [
                  { $regexMatch: { input: '$description', regex: escapedTerm, options: 'i' } },
                  50,
                  0
                ]
              },
              // BONUS: Length-based relevance (shorter titles with matches get bonus)
              {
                $cond: [
                  { 
                    $and: [
                      { $regexMatch: { input: '$title', regex: escapedTerm, options: 'i' } },
                      { $lt: [{ $strLenCP: '$title' }, 30] }
                    ]
                  },
                  25,
                  0
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          relevanceScore: -1,  // Sort by relevance first
          publishedAt: -1      // Then by date
        }
      },
      {
        $limit: 100
      }
    ]

    const posts = await db
      .collection('blogposts')
      .aggregate(aggregationPipeline)
      .toArray()

    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      slug: post.slug || '',
      publishedAt: formatDate(post.publishedAt),
      relevanceScore: post.relevanceScore || 0
    }))
  } catch (error) {
    console.error('Error with smart search:', error)
    // Fallback to simple search if aggregation fails
    return getSimpleSearch(db, searchTerm)
  }
}

// Fallback simple search function
async function getSimpleSearch(db, searchTerm) {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  const posts = await db
    .collection('blogposts')
    .find({
      $or: [
        { title: { $regex: escapedTerm, $options: 'i' } },
        { description: { $regex: escapedTerm, $options: 'i' } }
      ]
    })
    .sort({ publishedAt: -1 })
    .limit(100)
    .toArray()

  return posts.map(post => ({
    _id: post._id.toString(),
    title: post.title || '',
    description: post.description || '',
    slug: post.slug || '',
    publishedAt: formatDate(post.publishedAt),
    relevanceScore: 0
  }))
}

// Fetch a single post by slug
export async function getPostBySlug(slug) {
  const db = await connectDB()
  const post = await db.collection('blogposts').findOne({ slug })
  if (!post) return null

  return {
    _id: post._id.toString(),
    title: post.title || '',
    description: post.description || '',
    content: post.content || '',
    slug: post.slug || '',
    publishedAt: formatDate(post.publishedAt),
  }
}

// Helper function to create database indexes for better search performance
// Call this once to set up indexes (you can run this in a separate script or admin panel)
export async function createSearchIndexes() {
  const db = await connectDB()
  const collection = db.collection('blogposts')
  
  try {
    // Create text index for full-text search (more efficient than regex)
    await collection.createIndex(
      { title: 'text', description: 'text' },
      { 
        name: 'title_description_text',
        weights: { title: 2, description: 1 } // Give title higher priority
      }
    )
    
    // Create compound index for sorting
    await collection.createIndex({ publishedAt: -1 })
    
    // Create unique index on slug
    await collection.createIndex({ slug: 1 }, { unique: true })
    
    console.log('Search indexes created successfully')
    return true
  } catch (error) {
    console.error('Error creating indexes:', error)
    return false
  }
}

// Enhanced text search with smart relevance ranking
export async function getPostsWithTextSearch(search = '') {
  const db = await connectDB()
  
  if (!search || !search.trim()) {
    return getPosts('') // Use the smart search for empty queries
  }

  const searchTerm = search.trim()
  
  try {
    // First try MongoDB text search with custom scoring
    const textSearchPipeline = [
      {
        $match: { 
          $text: { $search: searchTerm }
        }
      },
      {
        $addFields: {
          textScore: { $meta: 'textScore' },
          relevanceScore: {
            $add: [
              // Base text search score (0-20)
              { $multiply: [{ $meta: 'textScore' }, 20] },
              
              // Bonus for exact matches and prefixes
              {
                $cond: [
                  { $regexMatch: { input: '$title', regex: `^${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, options: 'i' } },
                  100,
                  0
                ]
              },
              {
                $cond: [
                  { $regexMatch: { input: '$title', regex: `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, options: 'i' } },
                  50,
                  0
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          relevanceScore: -1,
          textScore: { $meta: 'textScore' },
          publishedAt: -1
        }
      },
      {
        $limit: 100
      }
    ]

    const posts = await db
      .collection('blogposts')
      .aggregate(textSearchPipeline)
      .toArray()

    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      slug: post.slug || '',
      publishedAt: formatDate(post.publishedAt),
      relevanceScore: post.relevanceScore || 0,
      textScore: post.textScore || 0
    }))
    
  } catch (error) {
    console.error('Error with enhanced text search, falling back to smart regex search:', error)
    // Fallback to the smart regex search
    return getPosts(search)
  }
}
