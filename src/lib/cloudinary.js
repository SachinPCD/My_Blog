// 📸 Cloudinary Configuration for Blog App
import { v2 as cloudinary } from 'cloudinary';

// Debug environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('🔧 Cloudinary Config Debug:');
console.log('Cloud Name:', cloudName ? '✅ Set' : '❌ Missing');
console.log('API Key:', apiKey ? '✅ Set' : '❌ Missing');
console.log('API Secret:', apiSecret ? '✅ Set' : '❌ Missing');

// Validate configuration
if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration incomplete!');
  console.error('Missing:', {
    cloudName: !cloudName,
    apiKey: !apiKey,
    apiSecret: !apiSecret
  });
  throw new Error('Cloudinary configuration is incomplete. Please check your environment variables.');
}

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

console.log('✅ Cloudinary configured successfully');

export default cloudinary;

// 🌟 Features Available:
// - Auto image optimization
// - Multiple format support (webp, avif, etc.)
// - Automatic resize and crop
// - CDN delivery worldwide
// - Transformation on-the-fly