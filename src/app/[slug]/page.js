import { getPostBySlug } from '@/lib/mongodb'
import { notFound } from 'next/navigation'

// Array of high-quality random images from Unsplash
const randomImages = [
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
]

// Function to get consistent random image based on post title
const getRandomImage = (title) => {
  const index = title.length % randomImages.length
  return randomImages[index]
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  
  try {
    const post = await getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }

    const postImage = getRandomImage(post.title)
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section with Image and Overlay */}
        <section className="relative h-96 md:h-[500px] lg:h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={postImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-6xl mx-auto w-full px-4 pb-12">
              {/* Back Button */}
              <div className="mb-6">
                <a 
                  href="/"
                  className="inline-flex items-center text-white/90 hover:text-white font-semibold backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full transition-all duration-300 hover:bg-black/50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Articles
                </a>
              </div>

              {/* Title and Meta */}
              <div className="text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl leading-relaxed">
                  {post.description}
                </p>
                <div className="flex items-center text-white/80">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{publishedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
          {/* Content Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16">
            <article className="prose prose-lg max-w-none">
              {post.content ? (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content 
                  }} 
                />
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Content Coming Soon</h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      We're working on bringing you the full content for this article. 
                      Check back soon for updates!
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <p className="text-blue-800 font-medium">
                        In the meantime, feel free to explore our other articles or 
                        contact us if you have specific questions about this topic.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Footer Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <a 
                  href="/"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 px-6 py-3 rounded-lg hover:bg-blue-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Articles
                </a>
                <div className="text-sm text-gray-500 text-center sm:text-right">
                  <p className="font-medium">Published on {publishedDate}</p>
                  <p className="text-gray-400">Share this article</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <a 
            href="/"
            className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params
  
  try {
    const post = await getPostBySlug(slug)
    
    if (!post) {
      return {
        title: 'Post Not Found'
      }
    }

    const postImage = getRandomImage(post.title)

    return {
      title: `${post.title} - Professional Blog`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        images: [postImage],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: ['Professional Blog'],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: [postImage],
      },
      alternates: {
        canonical: `https://yourdomain.com/${slug}`,
      }
    }
  } catch (error) {
    return {
      title: 'Post Not Found'
    }
  }
}