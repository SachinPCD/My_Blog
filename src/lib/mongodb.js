// lib/mongodb.js - Enhanced MongoDB Connection with Error Handling
import { MongoClient } from 'mongodb'

let client
let db
let isConnecting = false

// MongoDB connection options for better reliability
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  w: 'majority'
}

export async function connectDB() {
  console.log('🔗 MongoDB connection requested...')
  
  // Validate environment variables
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables')
    throw new Error('MONGODB_URI is not defined in .env')
  }
  
  if (!process.env.DB_NAME) {
    console.error('❌ DB_NAME is not defined in environment variables')
    throw new Error('DB_NAME is not defined in .env')
  }

  // If already connected and healthy, return existing connection
  if (client && db) {
    try {
      // Test the connection with a ping
      await client.db('admin').command({ ping: 1 })
      console.log('✅ Using existing MongoDB connection')
      return db
    } catch (error) {
      console.warn('⚠️ Existing connection is stale, reconnecting...', error.message)
      // Reset client and db to force reconnection
      client = null
      db = null
    }
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('⏳ Connection already in progress, waiting...')
    // Wait for the connection to complete
    let attempts = 0
    while (isConnecting && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    if (db) return db
  }

  isConnecting = true

  try {
    console.log('🔌 Creating new MongoDB connection...')
    console.log('🌐 MongoDB URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':***@'))
    console.log('🗄️ Database Name:', process.env.DB_NAME)

    // Create new client with enhanced options
    client = new MongoClient(process.env.MONGODB_URI, mongoOptions)
    
    // Connect with timeout
    console.log('⏱️ Connecting to MongoDB...')
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      )
    ])

    // Get database instance
    db = client.db(process.env.DB_NAME)
    
    // Test the connection
    await db.command({ ping: 1 })
    
    console.log('✅ MongoDB connected successfully')
    console.log('🏷️ Connected to database:', process.env.DB_NAME)
    
    // Setup connection event listeners
    client.on('close', () => {
      console.log('🔌 MongoDB connection closed')
      db = null
      client = null
    })

    client.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error)
      db = null
      client = null
    })

    client.on('timeout', () => {
      console.error('⏰ MongoDB connection timeout')
      db = null
      client = null
    })

    return db

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    console.error('🔍 Full error:', error)
    
    // Clean up failed connection attempt
    client = null
    db = null
    
    // Provide specific error messages for common issues
    if (error.message.includes('ENOTFOUND')) {
      throw new Error('Cannot resolve MongoDB host. Check your internet connection and MongoDB URI.')
    } else if (error.message.includes('authentication failed')) {
      throw new Error('MongoDB authentication failed. Check your username and password.')
    } else if (error.message.includes('timeout')) {
      throw new Error('MongoDB connection timeout. The database might be overloaded or unreachable.')
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Connection refused by MongoDB server. Check if the server is running.')
    } else {
      throw new Error(`MongoDB connection failed: ${error.message}`)
    }
  } finally {
    isConnecting = false
  }
}

// Enhanced connection with retry logic
export async function connectDBWithRetry(maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${maxRetries}`)
      return await connectDB()
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        console.error('🚨 All connection attempts failed')
        throw error
      }
      
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
}

// Graceful connection close
export async function closeDB() {
  try {
    if (client) {
      console.log('🔌 Closing MongoDB connection...')
      await client.close()
      client = null
      db = null
      console.log('✅ MongoDB connection closed successfully')
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
  }
}

// Health check function
export async function checkDBHealth() {
  try {
    if (!client || !db) {
      return { status: 'disconnected', message: 'No active connection' }
    }
    
    const startTime = Date.now()
    await db.command({ ping: 1 })
    const responseTime = Date.now() - startTime
    
    return {
      status: 'connected',
      message: 'Connection healthy',
      responseTime: `${responseTime}ms`,
      database: process.env.DB_NAME
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    }
  }
}

// Enhanced formatDate function to handle MongoDB Extended JSON
function formatDate(date) {
  if (!date) return new Date().toISOString()
  
  // Handle MongoDB Extended JSON format
  if (date && typeof date === 'object' && date.$date) {
    if (date.$date.$numberLong) {
      return new Date(parseInt(date.$date.$numberLong)).toISOString()
    } else {
      return new Date(date.$date).toISOString()
    }
  }
  // Handle other date formats
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString()
}

// Smart search with relevance ranking
export async function getPosts(search = '') {
  const db = await connectDBWithRetry()
  
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
        content: post.content || '',
        image: post.image || '',
        author: post.author || 'Unknown Author',
        authorEmail: post.authorEmail || '',
        authorImage: post.authorImage || '',
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
            { description: { $regex: escapedTerm, $options: 'i' } },
            { content: { $regex: escapedTerm, $options: 'i' } },
            { author: { $regex: escapedTerm, $options: 'i' } }
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
              // AUTHOR MATCHES: Bonus for author name matches
              {
                $cond: [
                  { $regexMatch: { input: '$author', regex: escapedTerm, options: 'i' } },
                  75,
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
      content: post.content || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorEmail: post.authorEmail || '',
      authorImage: post.authorImage || '',
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
        { description: { $regex: escapedTerm, $options: 'i' } },
        { content: { $regex: escapedTerm, $options: 'i' } },
        { author: { $regex: escapedTerm, $options: 'i' } }
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
    content: post.content || '',
    image: post.image || '',
    author: post.author || 'Unknown Author',
    authorEmail: post.authorEmail || '',
    authorImage: post.authorImage || '',
    publishedAt: formatDate(post.publishedAt),
    relevanceScore: 0
  }))
}

// Fetch a single post by slug - COMPLETE VERSION
export async function getPostBySlug(slug) {
  try {
    const db = await connectDBWithRetry()
    console.log('🔍 Searching for post with slug:', slug)
    
    const post = await db.collection('blogposts').findOne({ slug })
    console.log('📊 Post found:', post ? 'Yes' : 'No')
    
    if (!post) {
      console.log('❌ No post found with slug:', slug)
      return null
    }

    console.log('📝 Post fields:', Object.keys(post))
    console.log('👤 Author field:', post.author)
    console.log('📧 AuthorEmail field:', post.authorEmail)
    console.log('🖼️ AuthorImage field:', post.authorImage)

    const formattedPost = {
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      content: post.content || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorEmail: post.authorEmail || '',
      authorImage: post.authorImage || '',
      slug: post.slug || '',
      publishedAt: formatDate(post.publishedAt)
    }

    console.log('✅ Formatted post author:', formattedPost.author)
    return formattedPost

  } catch (error) {
    console.error('❌ Error in getPostBySlug:', error)
    throw new Error('Failed to fetch post from database: ' + error.message)
  }
}

// Get posts by author
export async function getPostsByAuthor(authorEmail) {
  try {
    const db = await connectDBWithRetry()
    const posts = await db
      .collection('blogposts')
      .find({ authorEmail: authorEmail })
      .sort({ publishedAt: -1 })
      .limit(50)
      .toArray()

    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      slug: post.slug || '',
      content: post.content || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorEmail: post.authorEmail || '',
      authorImage: post.authorImage || '',
      publishedAt: formatDate(post.publishedAt)
    }))
  } catch (error) {
    console.error('Error fetching posts by author:', error)
    throw new Error('Failed to fetch posts by author')
  }
}

// Update post views
export async function incrementPostViews(slug) {
  try {
    const db = await connectDBWithRetry()
    const result = await db
      .collection('blogposts')
      .updateOne(
        { slug: slug },
        { $inc: { views: 1 } }
      )
    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error incrementing post views:', error)
    return false
  }
}

// Update post likes
export async function incrementPostLikes(slug) {
  try {
    const db = await connectDBWithRetry()
    const result = await db
      .collection('blogposts')
      .updateOne(
        { slug: slug },
        { $inc: { likes: 1 } }
      )
    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error incrementing post likes:', error)
    return false
  }
}

// Helper function to create database indexes for better search performance
export async function createSearchIndexes() {
  const db = await connectDBWithRetry()
  const collection = db.collection('blogposts')
  
  try {
    // Create text index for full-text search
    await collection.createIndex(
      { 
        title: 'text', 
        description: 'text', 
        content: 'text',
        author: 'text'
      },
      { 
        name: 'full_text_search',
        weights: { 
          title: 3, 
          description: 2, 
          content: 1,
          author: 2
        }
      }
    )
    
    // Create compound indexes for sorting
    await collection.createIndex({ publishedAt: -1 })
    await collection.createIndex({ views: -1 })
    await collection.createIndex({ likes: -1 })
    
    // Create unique index on slug
    await collection.createIndex({ slug: 1 }, { unique: true })
    
    // Create index on author for faster author-based queries
    await collection.createIndex({ authorEmail: 1 })
    
    console.log('✅ Search indexes created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    return false
  }
}

// Enhanced text search with smart relevance ranking
export async function getPostsWithTextSearch(search = '') {
  const db = await connectDBWithRetry()
  
  if (!search || !search.trim()) {
    return getPosts('')
  }

  const searchTerm = search.trim()
  
  try {
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
              { $multiply: [{ $meta: 'textScore' }, 20] },
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
              },
              {
                $cond: [
                  { $regexMatch: { input: '$author', regex: searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options: 'i' } },
                  75,
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
      content: post.content || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorEmail: post.authorEmail || '',
      authorImage: post.authorImage || '',
      publishedAt: formatDate(post.publishedAt),
      relevanceScore: post.relevanceScore || 0,
      textScore: post.textScore || 0
    }))
    
  } catch (error) {
    console.error('Error with enhanced text search, falling back to smart regex search:', error)
    return getPosts(search)
  }
}

// Get popular posts (most viewed)
export async function getPopularPosts(limit = 10) {
  try {
    const db = await connectDBWithRetry()
    const posts = await db
      .collection('blogposts')
      .find({})
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .toArray()

    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      slug: post.slug || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorImage: post.authorImage || '',
      publishedAt: formatDate(post.publishedAt)
    }))
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  }
}

// Get recent posts
export async function getRecentPosts(limit = 10) {
  try {
    const db = await connectDBWithRetry()
    const posts = await db
      .collection('blogposts')
      .find({})
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray()

    return posts.map(post => ({
      _id: post._id.toString(),
      title: post.title || '',
      description: post.description || '',
      slug: post.slug || '',
      image: post.image || '',
      author: post.author || 'Unknown Author',
      authorImage: post.authorImage || '',
      publishedAt: formatDate(post.publishedAt)
    }))
  } catch (error) {
    console.error('Error fetching recent posts:', error)
    return []
  }
}