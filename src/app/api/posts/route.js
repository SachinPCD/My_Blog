// app/api/posts/route.js
import { getPosts, getPostsWithTextSearch } from '@/lib/mongodb'

export async function GET(req) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams)
    const searchTerm = search || ''
    
    // Use optimized text search if available, fallback to regex search
    const posts = await getPostsWithTextSearch(searchTerm)
    
    // Set appropriate cache headers
    const headers = {
      'Content-Type': 'application/json',
      // Cache for 1 minute for search results, longer for all posts
      'Cache-Control': searchTerm ? 'public, max-age=60' : 'public, max-age=300',
      'ETag': `"${Buffer.from(JSON.stringify(posts)).toString('base64').slice(0, 16)}"`,
    }
    
    return new Response(JSON.stringify(posts), { headers })
    
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch posts' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
