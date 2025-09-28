import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request) {
  try {
    console.log('🚀 Upload API called');
    
    // Check if cloudinary is configured
    if (!cloudinary || !cloudinary.config().cloud_name) {
      console.error('❌ Cloudinary not configured properly');
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary not configured' }, 
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    console.log('📁 File received:', file ? file.name : 'No file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      )
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' }, 
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' }, 
        { status: 400 }
      )
    }

    console.log('📊 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    console.log('🔄 Starting Cloudinary upload...');

    // Upload to Cloudinary with simplified options
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'blog-images',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      tags: ['blog', 'user-upload']
    })

    console.log('✅ Upload successful:', result.public_id);

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    })

  } catch (error) {
    console.error('❌ Cloudinary upload error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    let errorMessage = 'Upload failed';
    let statusCode = 500;
    
    if (error.message.includes('Invalid API key')) {
      errorMessage = 'Invalid Cloudinary API key';
    } else if (error.message.includes('Invalid cloud name')) {
      errorMessage = 'Invalid Cloudinary cloud name';
    } else if (error.http_code) {
      statusCode = error.http_code;
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        code: error.http_code || 'UNKNOWN'
      }, 
      { status: statusCode }
    )
  }
}