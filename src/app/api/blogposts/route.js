import { NextResponse } from 'next/server'
import { connectDBWithRetry } from '@/lib/mongodb'

export async function POST(request) {
  try {
    console.log('📝 POST /api/blogposts - Starting request')
    
    const body = await request.json()
    const { title, description, content, image, author, authorEmail, authorImage, slug } = body

    console.log('📋 Request data received:', { title, author, slug })

    // Validate required fields
    if (!title || !description || !content || !image || !author || !slug) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    
    // Connect to database - returns db object directly, not { db }
    const db = await connectDBWithRetry()

    
    // Check if slug already exists
    console.log('🔍 Checking for existing post with slug:', slug)
    const existingPost = await db.collection('blogposts').findOne({ slug })
    if (existingPost) {
      console.log('⚠️ Post with slug already exists:', slug)
      return NextResponse.json(
        { error: 'A blog post with this title already exists' },
        { status: 409 }
      )
    }

    console.log('📝 Creating new blog post...')
    // Create new blog post
    const newPost = {
      title,
      description,
      content,
      image,
      author,
      authorEmail,
      authorImage,
      slug,
      publishedAt: new Date(),
    }

    const result = await db.collection('blogposts').insertOne(newPost)
    
    console.log('✅ Blog post created successfully, ID:', result.insertedId)

    return NextResponse.json(
      { 
        message: 'Blog post created successfully',
        postId: result.insertedId 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const db = await connectDBWithRetry()
    const posts = await db.collection('blogposts')
      .find({})
      .sort({ publishedAt: -1 })
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}