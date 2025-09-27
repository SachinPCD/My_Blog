// pages/api/posts.js OR app/api/posts/route.js
import { getPosts } from '@/lib/mongodb'

export default async function handler(req, res) {
  try {
    const { search = '' } = req.query
    const posts = await getPosts(search)
    res.status(200).json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
}
