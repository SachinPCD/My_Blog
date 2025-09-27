import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, content, image, author, authorEmail, authorImage, slug } = body

    // Validate required fields
    if (!title || !description || !content || !image || !author || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
            async function testDB() {
            const db = await connectDB()
            console.log('Connected to DB:', db.databaseName)
            }
            testDB()
    const db = await connectDB()
    
    // Check if slug already exists
    const existingPost = await db.collection('blogposts').findOne({ slug })
    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog post with this title already exists' },
        { status: 409 }
      )
    }

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
    const db = await connectDB()
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