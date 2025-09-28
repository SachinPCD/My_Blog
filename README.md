# 📝 Professional Blog Application

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.20.0-green?logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.11-purple?logo=next-auth)](https://next-auth.js.org/)

A modern, full-stack blog application built with Next.js 15, featuring Google OAuth authentication, MongoDB integration, real-time search, markdown support, and a beautiful responsive UI.

## 🌟 Features

### 🔐 **Authentication & Authorization**
- **Google OAuth** integration using NextAuth.js
- **Custom email/password** authentication with JWT tokens
- **Secure session management** with persistent login state
- **Protected routes** and role-based access control

### 📝 **Content Management**
- **Rich markdown editor** with live preview
- **Syntax highlighting** for code blocks using Prism
- **Image upload** and management
- **Drag & drop** image selection from curated gallery
- **Auto-generated slugs** for SEO-friendly URLs

### 🔍 **Advanced Search & Discovery**
- **Smart search algorithm** with relevance scoring
- **Real-time search** with debouncing optimization
- **Full-text search** using MongoDB text indexes
- **Author-based filtering** and content discovery
- **Search result ranking** based on title, description, and content matches

### 🎨 **User Interface & Experience**
- **Responsive design** optimized for all devices
- **Modern gradient designs** and smooth animations
- **Loading states** and skeleton screens
- **Interactive components** with hover effects
- **Dark/Light theme** ready architecture

### ⚡ **Performance & Optimization**
- **Server-side rendering** (SSR) for SEO optimization
- **Static generation** for improved performance
- **Image optimization** with Next.js Image component
- **Database connection pooling** for efficient queries
- **Caching strategies** for faster response times

## 🏗️ Architecture Overview

### **Frontend Architecture**
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API Routes (Backend endpoints)
│   ├── [slug]/            # Dynamic blog post pages
│   ├── auth/              # Authentication pages
│   ├── create-blog/       # Blog creation interface
│   ├── Login/             # Login/Register interface
│   └── layout.js          # Root layout with providers
├── components/            # Reusable React components
├── lib/                   # Utility functions and database
└── pages/                 # Legacy pages (if any)
```

### **Backend Architecture**
```
API Routes:
├── /api/auth/             # Authentication endpoints
│   ├── [...nextauth]/     # NextAuth.js configuration
│   ├── login/            # Custom email/password login
│   └── register/         # User registration
├── /api/blogposts/       # Blog management
│   ├── /                 # CRUD operations
│   ├── /[id]/           # Individual post operations
│   └── /author/         # Author-specific posts
└── /api/posts/           # Public post retrieval
```

## 📦 Technology Stack

### **Core Framework**
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **Node.js** - Runtime environment

### **Database & ORM**
- **MongoDB 6.20.0** - NoSQL database
- **Native MongoDB Driver** - Direct database connection
- **Connection pooling** - Optimized database performance

### **Authentication**
- **NextAuth.js 4.24.11** - Authentication framework
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcryptjs 3.0.2** - Password hashing

### **Styling & UI**
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Custom CSS animations** - Smooth transitions and effects
- **Responsive design** - Mobile-first approach

### **Content & Search**
- **React Markdown 10.1.0** - Markdown rendering
- **React Syntax Highlighter 15.6.6** - Code syntax highlighting
- **Remark GFM 4.0.1** - GitHub Flavored Markdown
- **Fuse.js 7.1.0** - Fuzzy search library
- **Custom search algorithms** - Advanced relevance scoring

### **Development Tools**
- **ESLint 9.0** - Code linting and formatting
- **PostCSS** - CSS processing
- **dotenv 17.2.2** - Environment variable management

## 🚀 Getting Started

### **Prerequisites**
```bash
Node.js >= 18.0.0
npm or yarn package manager
MongoDB Atlas account or local MongoDB installation
Google OAuth credentials (for social login)
```

### **1. Clone the Repository**
```bash
git clone https://github.com/SachinPCD/My_Blog.git
cd blog-app
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
DB_NAME=Blogs_App

# NextAuth Configuration
NEXTAUTH_SECRET=your_super_secure_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret for custom authentication
JWT_SECRET=your_jwt_secret_key
```

### **4. Database Setup**
```bash
# Run database initialization script (if available)
node scripts/setup-indexes.js

# Or manually create indexes in MongoDB
# The application will auto-create collections on first use
```

### **5. Run Development Server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### **6. Build for Production**
```bash
npm run build
npm start
```

## 📁 Project Structure

### **Core Components**

#### **🏠 Homepage (`/src/app/page.js`)**
- **Smart search bar** with real-time filtering
- **Blog post grid** with responsive cards
- **Loading states** and error handling
- **SEO optimized** with meta tags

#### **✍️ Blog Editor (`/src/app/create-blog/page.js`)**
- **Markdown editor** with live preview
- **Image gallery** selection
- **Form validation** and error handling
- **Post management** (create, edit, delete)

#### **🔐 Authentication (`/src/app/Login/page.js`)**
- **Dual authentication** (Google OAuth + Email/Password)
- **Form validation** with real-time feedback
- **Secure session handling**
- **Redirect management**

#### **📖 Blog Post Viewer (`/src/app/[slug]/page.js`)**
- **Dynamic routing** based on post slug
- **Markdown rendering** with syntax highlighting
- **Social sharing** buttons
- **Author information** display
- **Related posts** suggestions

### **Reusable Components**

#### **🎴 BlogCard (`/src/components/BlogCard.jsx`)**
```jsx
Features:
- Responsive card layout
- Image lazy loading with fallbacks
- Reading time calculation
- Hover animations
- Link optimization
```

#### **📋 BlogList (`/src/components/BlogList.jsx`)**
```jsx
Features:
- Grid/List view toggle
- Skeleton loading states
- Search result highlighting
- Pagination support
- Empty state handling
```

#### **🔍 SearchBar (`/src/components/SearchBar.jsx`)**
```jsx
Features:
- Debounced input (300ms)
- Real-time suggestions
- Search history
- Loading indicators
- Keyboard shortcuts
```

#### **🔒 AuthProvider (`/src/components/AuthProvider.js`)**
```jsx
Features:
- NextAuth session management
- Context state sharing
- Authentication persistence
- Error boundary handling
```

### **Database Layer (`/src/lib/mongodb.js`)**

#### **🔗 Connection Management**
```javascript
- Connection pooling for performance
- Environment-based configuration
- Error handling and reconnection
- Database initialization
```

#### **🔍 Search Functions**
```javascript
getPosts(search)              // Basic post retrieval
getPostsWithTextSearch()      // Advanced text search
getPostBySlug(slug)          // Single post by slug
getPostsByAuthor(email)      // Author-specific posts
getPopularPosts(limit)       // Most viewed posts
getRecentPosts(limit)        // Latest posts
```

#### **📊 Analytics Functions**
```javascript
incrementPostViews(slug)     // Track post views
incrementPostLikes(slug)     // Track post engagement
createSearchIndexes()        // Database optimization
```

### **API Endpoints**

#### **🔐 Authentication Routes**
```javascript
POST /api/auth/login         // Email/password login
POST /api/auth/register      // User registration
GET/POST /api/auth/[...nextauth] // NextAuth handlers
```

#### **📝 Blog Management Routes**
```javascript
GET /api/posts               // Public post listing
POST /api/blogposts         // Create new post
GET /api/blogposts/[id]     // Get specific post
PUT /api/blogposts/[id]     // Update post
DELETE /api/blogposts/[id]  // Delete post
GET /api/blogposts/author   // Author's posts
```

## 🔧 Configuration Files

### **Next.js Configuration (`next.config.mjs`)**
```javascript
- App Router enabled
- Image optimization
- Build optimizations
- Environment variables
```

### **Package Configuration (`package.json`)**
```json
Scripts:
- "dev": Development server
- "build": Production build
- "start": Production server
- "lint": Code linting
```

### **Tailwind CSS Integration**
```javascript
- Utility classes for rapid development
- Custom color schemes
- Responsive breakpoints
- Component-based styling
```

## 🔒 Security Features

### **Authentication Security**
- **JWT token encryption** with rotating secrets
- **Password hashing** using bcrypt (12 salt rounds)
- **Session management** with secure cookies
- **CSRF protection** built into NextAuth
- **OAuth 2.0** implementation for Google

### **Data Security**
- **Input validation** on all forms
- **SQL injection prevention** (NoSQL injection for MongoDB)
- **XSS protection** through React's built-in sanitization
- **Environment variable** protection
- **API route protection** with middleware

### **Performance Security**
- **Rate limiting** on API endpoints
- **Request size limits** for uploads
- **Connection pooling** to prevent DoS
- **Error handling** without information leakage

## 🚀 Deployment

### **Platform Recommendations**
1. **Vercel** (Recommended for Next.js)
2. **Netlify**
3. **AWS Amplify**
4. **Railway**
5. **Heroku**

### **Environment Variables for Production**
```env
# Update these for production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=production_secret_key
```

### **Build Optimization**
```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npx @next/bundle-analyzer
```

## 📊 Performance Optimizations

### **Frontend Optimizations**
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image
- **CSS optimization** with Tailwind purging
- **Bundle analysis** and size reduction
- **Caching strategies** for static assets

### **Backend Optimizations**
- **Database indexing** for faster queries
- **Connection pooling** for concurrent users
- **Query optimization** with aggregation pipelines
- **Response compression** and caching
- **API response optimization**

### **Search Optimizations**
- **Relevance scoring** algorithm
- **Text indexing** in MongoDB
- **Debounced search** to reduce server load
- **Search result caching**
- **Fuzzy search** with Fuse.js

## 🐛 Troubleshooting

### **Common Issues**

#### **Database Connection**
```javascript
Error: "MONGODB_URI not defined"
Solution: Check .env.local file exists and has correct URI
```

#### **Authentication Issues**
```javascript
Error: "NextAuth configuration error"
Solution: Verify NEXTAUTH_SECRET and GOOGLE_CLIENT_ID are set
```

#### **Build Errors**
```javascript
Error: "Module not found"
Solution: Run npm install or check import paths
```

#### **Search Not Working**
```javascript
Error: "Search returns no results"
Solution: Ensure MongoDB text indexes are created
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Standards**
- **ESLint** configuration for consistent code style
- **Prettier** for code formatting
- **Conventional commits** for clear commit messages
- **Component documentation** with JSDoc
- **Test coverage** for critical functions

### **Feature Requests**
- Use GitHub Issues for bug reports
- Use GitHub Discussions for feature requests
- Follow the issue templates provided
- Include screenshots for UI-related issues

## 📈 Future Enhancements

### **Planned Features**
- [ ] **Comment system** with moderation
- [ ] **Tag-based categorization**
- [ ] **Advanced analytics dashboard**
- [ ] **Email notifications** for new posts
- [ ] **Social media integration**
- [ ] **Multi-language support**
- [ ] **Dark mode toggle**
- [ ] **Progressive Web App** (PWA)
- [ ] **Offline reading** capability
- [ ] **RSS feed** generation

### **Technical Improvements**
- [ ] **TypeScript** migration
- [ ] **Jest** test suite
- [ ] **Cypress** e2e testing
- [ ] **Storybook** component library
- [ ] **Docker** containerization
- [ ] **CI/CD** pipeline setup
- [ ] **Performance monitoring**
- [ ] **Error tracking** with Sentry

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **Vercel** for hosting and deployment platform
- **MongoDB** for the flexible NoSQL database
- **Tailwind CSS** for the utility-first CSS framework
- **NextAuth.js** for authentication made simple
- **React Community** for the extensive ecosystem

## 📧 Contact & Support

### **Developer Information**
- **Name**: Sachin PCD
- **GitHub**: [@SachinPCD](https://github.com/SachinPCD)
- **Repository**: [My_Blog](https://github.com/SachinPCD/My_Blog)
- **Email**: [Contact via GitHub](https://github.com/SachinPCD)

### **Project Links**
- **🌐 Live Demo**: [Deploy your own](https://vercel.com/new/clone?repository-url=https://github.com/SachinPCD/My_Blog)
- **📚 Documentation**: [GitHub Wiki](https://github.com/SachinPCD/My_Blog/wiki)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/SachinPCD/My_Blog/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/SachinPCD/My_Blog/discussions)

### **Support the Project**
If you find this project helpful, please consider:
- ⭐ **Starring** the repository
- 🍴 **Forking** and contributing
- 🐛 **Reporting** bugs and issues
- 💡 **Suggesting** new features
- 📢 **Sharing** with others

---

<div align="center">

**Built with ❤️ by [Sachin PCD](https://github.com/SachinPCD)**

*Happy Blogging! 🚀*

</div>

---

## 📝 Version History

### **v1.0.0** (Current)
- Initial release with core functionality
- Google OAuth and email authentication
- Markdown editor with live preview
- Advanced search with relevance scoring
- Responsive design with Tailwind CSS
- MongoDB integration with optimized queries

### **Development Roadmap**
- **v1.1.0**: Comment system and user interactions
- **v1.2.0**: Admin dashboard and analytics
- **v1.3.0**: Progressive Web App features
- **v2.0.0**: Complete TypeScript migration

---

*This documentation is regularly updated to reflect the latest features and improvements.*
