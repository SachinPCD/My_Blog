'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CreateBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: ''
  })
  const [isPreview, setIsPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Array of high-quality background images
  const backgroundImages = [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form
      if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.image) {
        throw new Error('Please select a background image')
      }

      const blogData = {
        ...formData,
        author: session.user.name,
        authorEmail: session.user.email,
        authorImage: session.user.image,
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        publishedAt: new Date().toISOString()
      }

      const res = await fetch('/api/blogposts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(blogData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create blog post')
      }

      setSuccess('Blog post created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        image: ''
      })

      // Redirect to blog list after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Blog</span>
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <div className="text-right">
                <p className="font-semibold text-gray-900">{session.user.name}</p>
                <p className="text-sm text-gray-600">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Blog Post
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your thoughts and ideas with the world. Write in markdown for rich formatting.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Background Image Selection */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Background Image</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {backgroundImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 ${
                      formData.image === image 
                        ? 'ring-4 ring-blue-500 scale-105' 
                        : 'hover:scale-102'
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {formData.image === image && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Details Form */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter blog post title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Brief description of your blog post"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Markdown Editor/Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setIsPreview(false)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    !isPreview
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Edit Markdown
                </button>
                <button
                  onClick={() => setIsPreview(true)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    isPreview
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 h-96 overflow-auto">
              {!isPreview ? (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full h-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                  placeholder="Write your blog content in markdown format...
                  
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- List item
1. Numbered item

```javascript
// Code block
console.log('Hello World');
```"
                  required
                />
              ) : (
                <div className="prose prose-lg max-w-none h-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {formData.content || '*Start writing to see preview...*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Markdown Help */}
            <div className="border-t border-gray-200 p-4 bg-gray-50/50">
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer font-medium">Markdown Guide</summary>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <code># Heading 1</code>
                  <code>**Bold**</code>
                  <code>## Heading 2</code>
                  <code>*Italic*</code>
                  <code>- List item</code>
                  <code>`code`</code>
                  <code>[Link](url)</code>
                  <code>![Image](url)</code>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Publish Blog Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}