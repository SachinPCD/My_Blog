'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  const router = useRouter()
  const { data: session, status } = useSession()

  // Initialize client-side only state and AOS
  useEffect(() => {
    setIsClient(true)
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    })
  }, [])

  // Handle redirect when session exists
  useEffect(() => {
    if (session && status === 'authenticated') {
      router.replace('/create-blog')
    }
  }, [session, status, router])

  // Don't render anything until we're on the client and checked session
  if (!isClient || status === 'loading' || (session && status === 'authenticated')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center" data-aos="zoom-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Handle login with NextAuth
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.error) {
          throw new Error('Invalid credentials')
        }

        if (result?.ok) {
          router.push('/create-blog')
          return
        }
      } else {
        // Handle registration with custom API
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        // After successful registration, switch to login mode
        setIsLogin(true)
        setFormData({ email: formData.email, password: '', name: '' })
        alert('Registration successful! Please log in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      // Explicitly redirect to create-blog after Google OAuth
      await signIn('google', { 
        callbackUrl: `${window.location.origin}/create-blog`,
        redirect: true 
      })
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setGoogleLoading(false)
    }
    // Don't set googleLoading to false here since we're redirecting
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({ email: '', password: '', name: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute top-10% left-5% w-80 h-80 bg-gradient-to-br from-blue-200/40 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10% right-5% w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-100/20 to-blue-100/20 rounded-full blur-2xl animate-pulse-slow"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <div className="text-center mb-8" data-aos="fade-down">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 group font-medium"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Auth Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden" data-aos="zoom-in" data-aos-delay="100">
            {/* Card Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="text-center">
                {/* Logo/Brand */}
                <div className="flex justify-center mb-6" data-aos="fade-up" data-aos-delay="200">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                {/* Welcome Text */}
                <div data-aos="fade-up" data-aos-delay="300">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {isLogin ? 'Welcome Back' : 'Join Our Community'}
                  </h1>
                  <p className="text-gray-600 text-lg font-light">
                    {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-3 gap-4 mt-8 mb-6" data-aos="fade-up" data-aos-delay="400">
                <div className="text-center group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Secure</span>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Fast</span>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Social</span>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <div className="px-8 pb-8">
              {/* Google Sign-In */}
              <div data-aos="fade-up" data-aos-delay="500">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group cursor-pointer"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 533.5 544.3">
                      <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h147.5c-6.4 34.4-25.7 63.6-54.7 83.2v68h88.4c51.7-47.7 80.8-118 80.8-196.1z"/>
                      <path fill="#34A853" d="M272 544.3c73.8 0 135.5-24.4 180.6-66.1l-88.4-68c-24.6 16.6-56 26.4-92.2 26.4-70.8 0-130.8-47.7-152.3-111.7h-90.3v70.2c44.6 88 136.2 149.2 242.6 149.2z"/>
                      <path fill="#FBBC05" d="M119.7 324.9c-10.7-31.4-10.7-65.4 0-96.8v-70.2h-90.3C-16 226.5-16 317.8 29.4 395l90.3-70.1z"/>
                      <path fill="#EA4335" d="M272 107.7c39.8 0 75.5 13.7 103.7 40.6l77.7-77.7C407.5 24.4 345.8 0 272 0 165.6 0 74 61.3 29.4 149.1l90.3 70.2C141.2 155.4 201.2 107.7 272 107.7z"/>
                    </svg>
                  )}
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6" data-aos="fade-up" data-aos-delay="600">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">or continue with email</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl" data-aos="shake">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div data-aos="fade-up" data-aos-delay="700">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md placeholder-gray-400"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10"></div>
                    </div>
                  </div>
                )}

                <div data-aos="fade-up" data-aos-delay={!isLogin ? "800" : "700"}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10"></div>
                  </div>
                </div>

                <div data-aos="fade-up" data-aos-delay={!isLogin ? "900" : "800"}>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    {isLogin && (
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div data-aos="fade-up" data-aos-delay={!isLogin ? "1000" : "900"}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg cursor-pointer"
                  >
                    {/* Loading Spinner */}
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </button>
                </div>
              </form>

              {/* Toggle Auth Mode */}
              <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="1100">
                <button
                  onClick={toggleAuthMode}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-300 group cursor-pointer"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-blue-600 hover:text-blue-700 font-semibold group-hover:underline">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8" data-aos="fade-up" data-aos-delay="1200">
            <p className="text-gray-500 text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-gray-400 text-xs mt-2">
              © 2024 Professional Blog. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Premium Custom CSS */}
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
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        /* Enhanced focus styles */
        input:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        /* Smooth transitions */
        * {
          transition-property: color, background-color, border-color, transform, box-shadow;
          transition-duration: 200ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}