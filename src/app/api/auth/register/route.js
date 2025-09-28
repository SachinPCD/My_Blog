import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const db = await connectDB()
    const usersCollection = db.collection('users')

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: 'User registered successfully',
      userId: result.insertedId,
    }, { status: 201 })

  } catch (error) {
    console.error('Error in register route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
