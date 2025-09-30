'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BlogList from '@/components/BlogList'
import SearchBar from '@/components/SearchBar'
import Fuse from 'fuse.js'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fuse, setFuse] = useState(null)
  const abortControllerRef = useRef(null)
  const router = useRouter()

  // Move fetchPosts declaration BEFORE the useEffect that uses it
  const fetchPosts = useCallback(async (searchValue = '') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/posts?search=${encodeURIComponent(searchValue)}`,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      )
      
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err)
        setError('Failed to load posts. Please try again.')
        setPosts([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // NOW the useEffect can safely use fetchPosts in its dependency array
  useEffect(() => {
    // Initialize AOS dynamically to avoid temporal dead zone issues
    const initAOS = async () => {
      try {
        const AOS = (await import('aos')).default
        await import('aos/dist/aos.css')
        
        AOS.init({
          duration: 800,
          easing: 'ease-out-cubic',
          once: true,
          offset: 50,
          delay: 0,
        })
      } catch (error) {
        console.warn('AOS initialization failed:', error)
      }
    }
    
    initAOS()
    fetchPosts() 
  }, [fetchPosts])

  useEffect(() => {
    if (posts && posts.length > 0) {
      const fuseInstance = new Fuse(posts, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'description', weight: 1.5 },
          { name: 'content', weight: 1 }
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
        findAllMatches: true
      })
      setFuse(fuseInstance)
    }
  }, [posts])

  const handleSearch = useCallback((value) => {
    setSearch(value)
    
    if (!value.trim()) {
      fetchPosts('')
      return
    }
    
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 100)
  }, [fetchPosts])

  const handleCreateBlog = () => {
    router.push('/Login')
  }

  const filteredPosts = useMemo(() => {
    if (!search.trim() || !fuse) {
      return posts
    }

    const results = fuse.search(search)
    return results.map(result => ({
      ...result.item,
      relevanceScore: 1 - (result.score || 0)
    }))
  }, [search, fuse, posts])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-300/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-200/25 to-pink-200/15 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-100/10 to-blue-100/10 rounded-full blur-2xl animate-pulse-slow"></div>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-16">
            <div className="text-center lg:text-left mb-8 lg:mb-0 lg:pr-12" data-aos="fade-right" data-aos-delay="100">
              {/* Premium Badge */}
              <div className="inline-flex items-center px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm mb-8" data-aos="fade-up" data-aos-delay="200">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Elite Blog Platform
                </span>
              </div>
              
              {/* Enhanced Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" data-aos="fade-up" data-aos-delay="300">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent block">
                  Professional
                </span>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block animate-gradient-x">
                  Blog
                </span>
              </h1>
              
              {/* Enhanced Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-600 font-light mb-8 max-w-2xl leading-relaxed" data-aos="fade-up" data-aos-delay="400">
                Discover insights, stories, and expertise from world-class writers and industry leaders.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl" data-aos="fade-up" data-aos-delay="500">
                <div className="flex items-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Premium Content</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Expert Writers</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Latest Insights</span>
                </div>
              </div>
            </div>
            
            {/* Premium Create Blog Button */}
            <div className="flex justify-center lg:justify-end" data-aos="fade-left" data-aos-delay="600">
              <button
                onClick={handleCreateBlog}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-500 ease-out hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
              >
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Button Content */}
                <span className="relative z-10 flex items-center text-lg font-semibold tracking-wide">
                  <svg className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Blog
                </span>
                
                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm group-hover:blur-md"></div>
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar Section */}
          <div className="max-w-3xl mx-auto mb-16" data-aos="fade-up" data-aos-delay="700">
            <div className="relative">
              <SearchBar 
                value={search} 
                onSearch={handleSearch} 
                isLoading={isLoading}
              />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-medium">
                Search through {posts.length} curated articles
              </div>
            </div>
          </div>
          
          {/* Premium Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="800">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">{posts.length}+</div>
              <div className="text-sm text-gray-600 font-medium">Articles Published</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Fresh Content</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-sm text-gray-600 font-medium">Quality Focus</div>
            </div>
          </div>

          {/* Premium Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8" data-aos="shake" data-aos-delay="100">
              <div className="p-6 bg-gradient-to-r from-red-50/90 to-orange-50/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-red-800 font-semibold text-lg">Content Loading Issue</h3>
                    <p className="text-red-700 mt-1 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Loading State */}
          {isLoading && filteredPosts.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-20" data-aos="zoom-in" data-aos-delay="200">
              <div className="flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
                  <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-3">Loading Premium Content</p>
                <p className="text-gray-500 max-w-md text-lg">Curating the finest articles and insights for your reading pleasure...</p>
              </div>
            </div>
          ) : (
            <div data-aos="fade-up" data-aos-delay="900">
              <BlogList posts={filteredPosts} searchTerm={search} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>

      {/* Premium Custom CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(40px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        @keyframes pulse-in {
          0% { 
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
          }
          100% { 
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
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
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-shake {
          animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        
        .animate-pulse-in {
          animation: pulse-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .shadow-3xl {
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 25px -5px rgba(59, 130, 246, 0.3),
            0 0 45px -10px rgba(139, 92, 246, 0.2);
        }
        
        /* Premium Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        
        /* Premium Selection Styles */
        ::selection {
          background: rgba(59, 130, 246, 0.2);
          color: #1e40af;
        }
        
        /* Smooth Focus Outlines */
        *:focus {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }
        
        /* Premium Backdrop Blur Support */
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-sm {
            backdrop-filter: blur(8px);
          }
        }
      `}</style>
    </div>
  )
}