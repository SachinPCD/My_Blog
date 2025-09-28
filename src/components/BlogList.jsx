import BlogCard from './BlogCard'

export default function BlogList({ posts, searchTerm = '', isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((skeleton) => (
          <div key={skeleton} className="w-full max-w-4xl mx-auto my-8 bg-white shadow-2xl rounded-3xl p-8 animate-pulse">
            <div className="flex items-center lg:flex-row flex-col">
              <div className="lg:w-[300px] lg:flex-shrink-0 lg:h-[300px] lg:-translate-x-20 lg:mb-0 mb-8 w-full h-64 -translate-y-20 lg:translate-y-0">
                <div className="w-full h-full bg-gray-300 rounded-2xl"></div>
              </div>
              <div className="lg:pr-8 lg:text-left text-center flex-1 space-y-4">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-full w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

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