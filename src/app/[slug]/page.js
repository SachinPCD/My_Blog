import { getPostBySlug } from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import AOS from 'aos'
import 'aos/dist/aos.css'
import '../blog-post.css'
import BlogPostClient, { ScrollToTopButton } from './BlogPostClient'

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

// Enhanced Markdown components with better styling
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <div className="my-6 rounded-xl overflow-hidden shadow-2xl" data-aos="fade-up">
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-300 text-sm font-mono">{match[1]}</span>
          <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </span>
        </div>
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: '0 0 12px 12px' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-2 py-1 rounded-lg text-sm font-mono border border-blue-200" {...props}>
        {children}
      </code>
    )
  },
  h1: ({ children }) => (
    <h1 
      className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mt-12 mb-6 pb-4 border-b-2 border-blue-100"
      data-aos="fade-up"
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 
      className="text-3xl font-bold text-gray-800 mt-10 mb-4 flex items-center"
      data-aos="fade-up"
    >
      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 
      className="text-2xl font-semibold text-gray-700 mt-8 mb-3"
      data-aos="fade-up"
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p 
      className="text-gray-700 leading-relaxed mb-6 text-lg"
      data-aos="fade-up"
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul 
      className="space-y-3 mb-6"
      data-aos="fade-up"
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol 
      className="space-y-3 mb-6 list-decimal list-inside"
      data-aos="fade-up"
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-700 leading-relaxed text-lg flex items-start">
      <span className="text-blue-500 mr-3 mt-2">•</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote 
      className="border-l-4 border-blue-500 pl-6 italic text-gray-600 my-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-r-2xl shadow-sm"
      data-aos="fade-up"
    >
      <div className="text-blue-500 text-4xl mb-2">&ldquo;</div>
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a 
      href={href} 
      className="text-blue-600 hover:text-blue-800 font-medium underline transition-all duration-300 hover:bg-blue-50 px-1 rounded"
      target="_blank" 
      rel="noopener noreferrer"
      data-aos="fade-up"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-gray-900 bg-gradient-to-r from-yellow-100 to-orange-100 px-1 rounded">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 px-1 rounded">
      {children}
    </em>
  ),
  img: ({ src, alt }) => (
    <span 
      className="block my-8 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]"
      data-aos="zoom-in"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover block"
        loading="lazy"
      />
      {alt && (
        <span className="block bg-white/90 backdrop-blur-sm p-4 text-center">
          <span className="text-gray-600 text-sm italic">{alt}</span>
        </span>
      )}
    </span>
  ),
  table: ({ children }) => (
    <div 
      className="overflow-x-auto my-8 rounded-2xl shadow-lg"
      data-aos="fade-up"
    >
      <table className="min-w-full bg-white rounded-2xl overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-6 py-4 border-b border-gray-200 text-gray-700">
      {children}
    </td>
  ),
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  
  // Don't try to fetch posts for known app routes
  const reservedSlugs = ['auth', 'create-blog', 'api', '_next', 'Login']
  if (reservedSlugs.includes(slug)) {
    notFound()
  }
  
  try {
    const post = await getPostBySlug(slug)
    
    if (!post) {
      notFound()
    }

    // Use post image from database or fallback to random image
    const postImage = post.image || getRandomImage(post.title)
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Calculate reading time
    const readingTime = Math.ceil(post.content ? post.content.split(/\s+/).length / 200 : 1)

    return (
      <BlogPostClient>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute top-10% left-5% w-80 h-80 bg-gradient-to-br from-blue-200/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10% right-5% w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/20 rounded-full blur-3xl animate-float-slow"></div>

        {/* Hero Section with Parallax Effect */}
        <section className="relative h-96 md:h-[500px] lg:h-[600px] w-full overflow-hidden group">
          {/* Background Image with Parallax */}
          <div className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-700">
            <img 
              src={postImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-6xl mx-auto w-full px-4 pb-12">
              {/* Back Button */}
              <div className="mb-8" data-aos="fade-right" data-aos-delay="200">
                <Link 
                  href="/"
                  className="inline-flex items-center text-white/90 hover:text-white font-semibold backdrop-blur-sm bg-black/40 px-6 py-3 rounded-full transition-all duration-300 hover:bg-black/60 hover:scale-105 cursor-pointer group/back"
                >
                  <svg className="w-5 h-5 mr-2 group-hover/back:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Articles
                </Link>
              </div>

              {/* Title and Meta */}
              <div className="text-white">
                <h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  {post.title}
                </h1>
                <p 
                  className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed drop-shadow-lg"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  {post.description}
                </p>
                
                {/* Author Info and Metadata */}
                <div 
                  className="flex flex-wrap items-center gap-6"
                  data-aos="fade-up"
                  data-aos-delay="500"
                >
                  {/* Author Profile */}
                  <div className="flex items-center space-x-4 group/author">
                    <div className="relative">
                      {post.authorImage && post.authorImage.trim() !== '' ? (
                        <img
                          src={post.authorImage}
                          alt={post.author}
                          className="w-14 h-14 rounded-full border-2 border-white/80 group-hover/author:border-white transition-all duration-300"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full border-2 border-white/80 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover/author:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-xl">
                            {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{post.author}</p>
                      <p className="text-white/80 text-sm">{post.authorEmail}</p>
                    </div>
                  </div>
                  
                  {/* Publication Details */}
                  <div className="flex items-center space-x-6 text-white/80">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{publishedDate}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{readingTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" data-aos="fade-up" data-aos-delay="600">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-12 lg:py-16 -mt-20 relative z-20">
          {/* Content Container */}
          <div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 border border-white/20 hover:shadow-3xl transition-all duration-500"
            data-aos="fade-up"
            data-aos-delay="200"
          > 
           
            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              {post.content ? (
                <div className="text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div 
                  className="text-center py-16"
                  data-aos="zoom-in"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">Content Coming Soon</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      We&rsquo;re working on bringing you the full content for this article. 
                      Check back soon for updates!
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                      <p className="text-blue-800 font-medium text-lg">
                        In the meantime, feel free to explore our other articles or 
                        contact us if you have specific questions about this topic.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Article Footer */}
            <div 
              className="mt-16 pt-12 border-t border-gray-200/50"
              data-aos="fade-up"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                {/* Author Bio */}
                <div className="flex items-center space-x-6 group/author-bio">
                  <div className="relative">
                    {post.authorImage && post.authorImage.trim() !== '' ? (
                      <img
                        src={post.authorImage}
                        alt={post.author}
                        className="w-20 h-20 rounded-2xl border-4 border-blue-500 group-hover/author-bio:border-purple-500 transition-all duration-300 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-4 border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover/author-bio:scale-105 transition-transform duration-300 shadow-lg">
                        <span className="text-white font-bold text-2xl">
                          {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl mb-2">Written by {post.author}</h4>
                    <p className="text-gray-600 mb-1">{post.authorEmail}</p>
                    <p className="text-sm text-gray-500">Published on {publishedDate}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl cursor-pointer group/cta"
                  >
                    <svg className="w-5 h-5 mr-3 group-hover/cta:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Explore More Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Navigation */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
          {/* Scroll to Top */}
          <ScrollToTopButton />

          {/* Back to Articles */}
          <Link 
            href="/"
            className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4 rounded-2xl shadow-2xl hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-110 cursor-pointer group lg:hidden"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: '0%' }}
            id="progress-bar"
          ></div>
        </div>
      </div>
      </BlogPostClient>
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

    const postImage = post.image || getRandomImage(post.title)

    return {
      title: `${post.title} - Professional Blog`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        images: [postImage],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: [postImage],
        creator: post.author,
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