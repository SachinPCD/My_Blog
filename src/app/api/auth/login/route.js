import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const db = await connectDB()
    const usersCollection = db.collection('users')

    // Check if user exists
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    )

    return NextResponse.json({ message: 'Login successful', token }, { status: 200 })

  } catch (error) {
    console.error('Error in login route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
