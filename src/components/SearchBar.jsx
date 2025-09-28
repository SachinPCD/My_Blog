'use client'

import { useState, useEffect, useRef } from 'react'

export default function SearchBar({ value, onSearch, isLoading = false }) {
  const [inputValue, setInputValue] = useState(value || '')
  const debounceRef = useRef(null)
  
  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Debounced search function with adaptive delay
  const debouncedSearch = (searchValue) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Adaptive delay: shorter for single characters, longer for words
    const trimmedValue = searchValue.trim()
    const delay = trimmedValue.length <= 1 ? 150 : 250 // Faster for single chars
    
    // Set new timeout
    debounceRef.current = setTimeout(() => {
      onSearch(trimmedValue)
    }, delay)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Trigger debounced search
    debouncedSearch(newValue)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Clear debounce and search immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    onSearch(inputValue.trim())
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <form className="mb-6 flex relative" onSubmit={handleSubmit}>
      <div className="flex-1 relative">
        <input
          type="text"
          name="search"
          placeholder="Search blog posts..."
          value={inputValue}
          onChange={handleInputChange}
          className="py-3 px-4 w-full border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-r-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
