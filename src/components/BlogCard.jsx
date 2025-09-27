'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BlogCard({ post }) {
  const [date, setDate] = useState('')

  useEffect(() => {
    if (post.publishedAt) {
      setDate(new Date(post.publishedAt).toLocaleDateString())
    }
  }, [post.publishedAt])

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-white shadow-2xl rounded-3xl p-8 transition-all duration-300 hover:shadow-3xl">
      <div className="flex items-center lg:flex-row flex-col">
        {/* Image Container */}
        <div className="lg:w-[300px] lg:flex-shrink-0 lg:h-[300px] lg:-translate-x-20 lg:mb-0 mb-8 w-full h-64 -translate-y-20 lg:translate-y-0">
          <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-80 rounded-2xl z-10"></div>
            <img 
              src={post.image || "https://res.cloudinary.com/muhammederdem/image/upload/v1535759872/kuldar-kalvik-799168-unsplash.jpg"} 
              alt={post.title}
              className="w-full h-full object-cover rounded-2xl relative z-0"
              onError={(e) => {
                e.target.src = "https://res.cloudinary.com/muhammederdem/image/upload/v1535759872/kuldar-kalvik-799168-unsplash.jpg"
              }}
            />
          </div>
        </div>

        {/* Content Container */}
        <div className="lg:pr-8 lg:text-left text-center flex-1">
          <span className="text-gray-600 font-medium mb-4 block">{date}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
            {post.description}
          </p>
          <Link 
            href={`/${post.slug}`}
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
          >
            READ MORE
          </Link>
        </div>
      </div>
    </div>
  )
}