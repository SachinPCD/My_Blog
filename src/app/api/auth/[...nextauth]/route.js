import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const db = await connectDB();
          const usersCollection = db.collection('users');
          
          const user = await usersCollection.findOne({ email: credentials.email });
          if (!user) return null;
          
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) return null;
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email.split('@')[0],
            image: user.image || null
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/Login',
    error: '/Login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to create-blog after successful authentication
      if (url.includes('/api/auth/signin') || url.includes('/api/auth/callback')) {
        return `${baseUrl}/create-blog`;
      }
      // If callbackUrl is specified and it's create-blog, honor it
      if (url.includes('callbackUrl=%2Fcreate-blog') || url.includes('callbackUrl=/create-blog')) {
        return `${baseUrl}/create-blog`;
      }
      // Default redirect to create-blog for any auth success
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/create-blog`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
