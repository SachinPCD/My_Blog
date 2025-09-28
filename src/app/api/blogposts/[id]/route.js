import { NextResponse } from 'next/server'
import { connectDBWithRetry } from '@/lib/mongodb'
import { ObjectId } from 'mongodb' // 
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const db = await connectDBWithRetry()
    
    const result = await db.collection('blogposts').deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
    
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}