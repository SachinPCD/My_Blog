import { NextResponse } from 'next/server'
import { checkDBHealth, connectDBWithRetry } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('🔍 Database health check requested')
    
    // Check environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      DB_NAME: !!process.env.DB_NAME
    }
    
    if (!envCheck.MONGODB_URI || !envCheck.DB_NAME) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        environment: envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // Test connection
    const healthStatus = await checkDBHealth()
    
    // If connection is unhealthy, try to reconnect
    if (healthStatus.status !== 'connected') {
      console.log('🔄 Attempting to reconnect to database...')
      try {
        await connectDBWithRetry(2, 1000)
        const newHealthStatus = await checkDBHealth()
        
        return NextResponse.json({
          status: 'reconnected',
          message: 'Database reconnected successfully',
          health: newHealthStatus,
          environment: envCheck,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        return NextResponse.json({
          status: 'failed',
          message: 'Failed to reconnect to database',
          error: error.message,
          health: healthStatus,
          environment: envCheck,
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection is healthy',
      health: healthStatus,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}