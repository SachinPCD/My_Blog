'use client'
import { useState, useEffect, useRef,useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import AOS from 'aos'
import 'aos/dist/aos.css'

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
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userPosts, setUserPosts] = useState([])
  const [activeTab, setActiveTab] = useState('create')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeImageTab, setActiveImageTab] = useState('upload') // 'upload', 'url', 'stock'
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [uploadedImages, setUploadedImages] = useState([])
  const cursorPosition = useRef(0)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    })
  }, [])

  // Array of high-quality background images for blog cover
  const backgroundImages = [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ]

  // Array of stock content images
  const stockImages = [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/Login')
    }
  }, [status, router])

  // Fetch user's previous posts
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPosts()
    }
  }, [session, fetchUserPosts])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false)
      }
      if (showImageModal && !event.target.closest('.image-modal')) {
        setShowImageModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown, showImageModal])

  const fetchUserPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/blogposts/author?email=${session.user.email}`)
      const data = await res.json()
      
      if (res.ok) {
        setUserPosts(data)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  // � Professional Cloudinary Upload Implementation
  const uploadImage = async (file) => {
    try {
      setImageUploading(true)
      setUploadProgress(0)
      setError('') // Clear any existing errors

      console.log('🚀 Starting Cloudinary upload for:', file.name, 'Size:', file.size);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10
          return prev
        })
      }, 200)

      // Upload to Cloudinary via API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)

      console.log('✅ Cloudinary upload successful:', result.url);

      // Add to uploaded images list for quick access
      setUploadedImages(prev => [{
        url: result.url,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        size: result.bytes,
        type: file.type,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }, ...prev])

      return result.url

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error)
      setError(error.message || 'Failed to upload image')
      throw new Error(error.message || 'Failed to upload image')
    } finally {
      setImageUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files.length) return

    try {
      for (let file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files')
          continue
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB')
          continue
        }

        const imageUrl = await uploadImage(file)
        // Auto-insert the first uploaded image
        if (imageUrl && files.length === 1) {
          insertImageAtCursor(imageUrl, file.name)
        }
      }
    } catch (error) {
      setError(error.message)
    }
  }

  // Handle URL image insertion
  const handleUrlImageInsert = () => {
    if (!customImageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    try {
      // Basic URL validation
      new URL(customImageUrl)
      insertImageAtCursor(customImageUrl, 'Custom Image')
      setCustomImageUrl('')
    } catch (error) {
      setError('Please enter a valid image URL')
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  // Handle background image selection
  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }))
  }

  const insertImageAtCursor = (imageUrl, altText = 'Blog Image') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = cursorPosition.current
    const end = cursorPosition.current
    const imageMarkdown = `\n\n![${altText}](${imageUrl})\n\n`

    const newContent = formData.content.substring(0, start) + imageMarkdown + formData.content.substring(end)
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }))

    // Set cursor position after inserted image
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + imageMarkdown.length
      textarea.setSelectionRange(newPosition, newPosition)
      cursorPosition.current = newPosition
    }, 0)

    setShowImageModal(false)
  }

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      cursorPosition.current = textareaRef.current.selectionStart
    }
  }

  const handleKeyInsert = (markdown) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    
    let newContent = ''
    let newCursorPos = start + markdown.length

    if (selectedText) {
      newContent = formData.content.substring(0, start) + markdown.replace('{text}', selectedText) + formData.content.substring(end)
      newCursorPos = start + markdown.replace('{text}', selectedText).length
    } else {
      newContent = formData.content.substring(0, start) + markdown + formData.content.substring(end)
    }

    setFormData(prev => ({
      ...prev,
      content: newContent
    }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      cursorPosition.current = newCursorPos
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
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
        },
        body: JSON.stringify(blogData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create blog post')
      }

      setSuccess('Blog post created successfully!')
      
      setFormData({
        title: '',
        description: '',
        content: '',
        image: ''
      })

      await fetchUserPosts()
      setActiveTab('manage')

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId, postTitle) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(postId)
    try {
      const res = await fetch(`/api/blogposts/${postId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete post')
      }

      setSuccess('Blog post deleted successfully!')
      setDeleteLoading('refreshing')
      await fetchUserPosts()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditPost = (post) => {
    setFormData({
      title: post.title,
      description: post.description,
      content: post.content,
      image: post.image
    })
    setActiveTab('create')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    img({ node, ...props }) {
      return (
        <span className="inline-block my-6 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 w-full">
          <img {...props} alt={props.alt || ''} className="w-full h-auto object-cover block" />
        </span>
      )
    },
    p({ node, children, ...props }) {
      // Check if paragraph contains only an image
      const hasOnlyImage = node?.children?.length === 1 && node.children[0].tagName === 'img'
      
      if (hasOnlyImage) {
        // Render image without paragraph wrapper to avoid nesting issues
        return <>{children}</>
      }
      
      return <p {...props}>{children}</p>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center" data-aos="zoom-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute top-10% left-5% w-80 h-80 bg-gradient-to-br from-blue-200/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10% right-5% w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/20 rounded-full blur-3xl animate-float-slow"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-300 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer group"
                data-aos="fade-right"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Blog</span>
              </button>
            </div>
            
            {/* User Info with Dropdown */}
            <div className="relative profile-dropdown" data-aos="fade-left">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={session?.user?.image || "/image.png"}
                      alt={session?.user?.name || "User"}
                      className="w-10 h-10 rounded-full border-2 border-blue-500 group-hover:border-blue-600 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {session?.user?.name}
                    </p>
                    <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showProfileDropdown ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200/50">
                    <p className="font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                    <p className="text-sm text-gray-600 truncate">{session?.user?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setActiveTab('manage')
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                      Manage Posts
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setActiveTab('create')
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Post
                    </button>
                    
                    <div className="border-t border-gray-200/50 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        router.push('/')
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Back to Home
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200/50 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer group"
                    >
                      <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Page Header */}
        <div className="text-center mb-8" data-aos="fade-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Blog Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create new blog posts and manage your existing content
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake" data-aos="fade-up">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-pulse-in" data-aos="fade-up">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-medium">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8" data-aos="fade-up" data-aos-delay="100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Post
              </div>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'manage'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Manage Posts ({userPosts.length})
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'create' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Form */}
                <div className="space-y-6">
                  {/* Background Image Selection */}
                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20" data-aos="fade-right">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Cover Image</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {backgroundImages.map((image, index) => (
                        <div
                          key={index}
                          className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 ${
                            formData.image === image 
                              ? 'ring-4 ring-blue-500 scale-105 shadow-lg' 
                              : 'hover:scale-102 hover:shadow-md'
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
                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20" data-aos="fade-right" data-aos-delay="100">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white/50"
                          placeholder="Brief description of your blog post"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Markdown Editor/Preview */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden" data-aos="fade-left">
                  <div className="border-b border-gray-200">
                    <div className="flex">
                      <button
                        onClick={() => setIsPreview(false)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition-colors cursor-pointer ${
                          !isPreview
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Edit Markdown
                      </button>
                      <button
                        onClick={() => setIsPreview(true)}
                        className={`flex-1 py-4 px-6 text-center font-medium transition-colors cursor-pointer ${
                          isPreview
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Markdown Toolbar */}
                  {!isPreview && (
                    <div className="border-b border-gray-200 bg-gray-50/50 p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleKeyInsert('**{text}**')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        onClick={() => handleKeyInsert('*{text}*')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Italic"
                      >
                        <em>I</em>
                      </button>
                      <button
                        onClick={() => handleKeyInsert('# {text}')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Heading 1"
                      >
                        H1
                      </button>
                      <button
                        onClick={() => handleKeyInsert('## {text}')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => handleKeyInsert('[{text}](url)')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Link"
                      >
                        Link
                      </button>
                      <button
                        onClick={() => handleKeyInsert('> {text}')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Blockquote"
                      >
                        Quote
                      </button>
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="px-3 py-1.5 text-sm bg-blue-500 text-white border border-blue-600 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                        title="Insert Image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </button>
                    </div>
                  )}

                  <div className="p-6 h-96 overflow-auto">
                    {!isPreview ? (
                      <textarea
                        ref={textareaRef}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        onClick={handleTextareaClick}
                        onKeyUp={handleTextareaClick}
                        className="w-full h-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm bg-white/50"
                        placeholder="Write your blog content in markdown format... Use the toolbar above to format your text."
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
                </div>
              </div>
            ) : (
              /* Manage Posts Tab */
              <div className="space-y-6" data-aos="fade-up">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Your Blog Posts</h3>
                  <span className="text-sm text-gray-500">{userPosts.length} posts</span>
                </div>

                {isLoading && deleteLoading !== 'refreshing' ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your posts...</p>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h4>
                    <p className="text-gray-600 mb-4">Create your first blog post to get started!</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {userPosts.map((post, index) => (
                      <div 
                        key={post._id} 
                        className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{post.title}</h4>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{formatDate(post.publishedAt)}</span>
                                  <span>•</span>
                                  <span>{Math.ceil(post.content?.length / 200) || 1} min read</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => router.push(`/${post.slug}`)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            
                            <button
                              onClick={() => handleEditPost(post)}
                              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDeletePost(post._id, post.title)}
                              disabled={deleteLoading === post._id}
                              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {deleteLoading === post._id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              {deleteLoading === post._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button for Create Tab */}
        {activeTab === 'create' && (
          <div className="flex justify-center" data-aos="fade-up" data-aos-delay="200">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Publish Blog Post
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="image-modal bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-modal-in">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Insert Image</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Image Source Tabs */}
              <div className="flex border-b border-gray-200 mt-4">
                <button
                  onClick={() => setActiveImageTab('upload')}
                  className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                    activeImageTab === 'upload'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload from PC
                </button>
                <button
                  onClick={() => setActiveImageTab('url')}
                  className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                    activeImageTab === 'url'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  From URL
                </button>
                <button
                  onClick={() => setActiveImageTab('stock')}
                  className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                    activeImageTab === 'stock'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Stock Images
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh]">
              {activeImageTab === 'upload' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
                    <p className="text-gray-600">Click to browse or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>

                  {/* Upload Progress */}
                  {imageUploading && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Uploading...</span>
                        <span className="text-sm text-blue-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Recently Uploaded</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((image, index) => {
                          // Handle both old string URLs and new Firebase objects
                          const imageUrl = typeof image === 'string' ? image : image.url
                          const imageName = typeof image === 'string' ? `Uploaded Image ${index + 1}` : image.name
                          
                          return (
                            <div
                              key={index}
                              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg group"
                              onClick={() => insertImageAtCursor(imageUrl, imageName)}
                              title={`Click to insert: ${imageName}`}
                            >
                              <img
                                src={imageUrl}
                                alt={imageName}
                                className="w-full h-full object-cover"
                              />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeImageTab === 'url' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleUrlImageInsert}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Insert
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the direct URL of the image you want to insert
                    </p>
                  </div>
                </div>
              )}

              {activeImageTab === 'stock' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stockImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg group"
                      onClick={() => insertImageAtCursor(image, `Stock Image ${index + 1}`)}
                    >
                      <img
                        src={image}
                        alt={`Stock Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
          }
          33% { 
            transform: translateY(-30px) rotate(2deg);
          }
          66% { 
            transform: translateY(15px) rotate(-1deg);
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1);
          }
          33% { 
            transform: translate(40px, -20px) scale(1.1);
          }
          66% { 
            transform: translate(-30px, 15px) scale(0.9);
          }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pulse-in {
          0% { 
            opacity: 0;
            transform: scale(0.9);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes modal-in {
          from { 
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse-in {
          animation: pulse-in 0.3s ease-out forwards;
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  )
}