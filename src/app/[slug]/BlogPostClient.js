'use client'
import { useEffect } from 'react'
import AOS from 'aos'

export function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button 
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 cursor-pointer group"
      onClick={scrollToTop}
    >
      <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}

export default function BlogPostClient({ children }) {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    })

    // Progress bar functionality
    const updateProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      const progressBar = document.getElementById('progress-bar')
      if (progressBar) {
        progressBar.style.width = scrolled + '%'
      }
    }

    window.addEventListener('scroll', updateProgress)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  return <>{children}</>
}