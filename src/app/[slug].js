import { getPostBySlug } from './lib/mongodb'
import ErrorPage from 'next/error'

export async function getServerSideProps({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return { notFound: true }
  return { props: { post } }
}

export default function BlogPostPage({ post }) {
  if (!post) return <ErrorPage statusCode={404} />
  return (
    <div className="max-w-2xl mx-auto pt-16 px-4">
      <h1 className="text-4xl font-extrabold mb-2 text-blue-900">{post.title}</h1>
      <div className="mb-2 text-gray-500">{new Date(post.publishedAt).toLocaleDateString()}</div>
      <div className="mb-8 text-lg text-gray-700">{post.description}</div>
      <article className="prose prose-lg">{post.content}</article>
    </div>
  )
}
