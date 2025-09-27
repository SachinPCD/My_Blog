import BlogCard from './BlogCard'

export default function BlogList({ posts, searchTerm = '' }) {
  if (!posts || posts.length === 0) {
    if (searchTerm) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">
            No posts found for "{searchTerm}"
          </div>
          <p className="text-gray-500 text-sm">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )
    }
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg">No posts available.</div>
      </div>
    )
  }

  return (
    <div>
      {searchTerm && (
        <div className="mb-6 text-sm text-gray-600 text-center">
          Found {posts.length} post{posts.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}
      <div className="space-y-12"> {/* Increased spacing for better visual separation */}
        {posts.map((post) => (
          <div key={post._id}>
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}