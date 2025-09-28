'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Login page
    router.push('/Login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Redirecting to login...</p>
      </div>
    </div>
  )
}