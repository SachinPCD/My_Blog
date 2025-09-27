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

  useEffect(() => {
    fetchPosts() 
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Create Blog Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-2 animate-fade-in">
              Professional Blog
            </h1>
            <p className="text-lg text-gray-600 font-medium animate-fade-in-up delay-100">
              Discover insights, stories, and expertise
            </p>
          </div>
          
          <button
            onClick={handleCreateBlog}
            className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-out hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Blog
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200">
          <SearchBar 
            value={search} 
            onSearch={handleSearch} 
            isLoading={isLoading}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 animate-shake">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && filteredPosts.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16 animate-pulse-in">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-600 font-medium">Loading posts...</p>
              <p className="text-sm text-gray-500 mt-1">Discovering amazing content</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up delay-300">
            <BlogList posts={filteredPosts} searchTerm={search} />
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pulse-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse-in {
          animation: pulse-in 0.4s ease-out forwards;
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
      `}</style>
    </div>
  )
}