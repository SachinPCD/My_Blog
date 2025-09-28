import { NextResponse } from 'next/server'
import { getPostsByAuthor } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    const posts = await getPostsByAuthor(email)
    return NextResponse.json(posts)
    
  } catch (error) {
    console.error('Error fetching posts by author:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}