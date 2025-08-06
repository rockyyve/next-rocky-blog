import Container from "@/app/_components/container";
import { Intro } from "@/app/_components/intro";
import { PostPreview } from "@/app/_components/post-preview";
import { getAllPosts } from "@/lib/api";
import { Metadata } from "next";

// 🎯 ISR 配置：首页每5分钟重新验证一次
export const revalidate = 300;

// 🔄 首页 Metadata
export const metadata: Metadata = {
  title: "Rocky Blog - Web Development & Tech Insights",
  description: "A modern blog about web development, technology, and programming insights. Stay updated with the latest trends and tutorials.",
  openGraph: {
    title: "Rocky Blog",
    description: "A modern blog about web development, technology, and programming insights.",
    url: "/",
    siteName: "Rocky Blog",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Rocky Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function Index() {
  const allPosts = await getAllPosts();
  console.log("🚀 ~ Index ~ allPosts:", allPosts);

  return (
    <main>
      <Container>
        <Intro />
        
        {/* 博客列表部分 */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
              📚 Latest Posts
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'}
            </div>
          </div>
          
          {allPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 mb-32">
              {allPosts.map((post) => (
                <article 
                  key={post.slug}
                  className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700"
                >
                  <PostPreview
                    title={post.title}
                    coverImage={post.coverImage}
                    date={post.date}
                    author={post.author}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    author_id={post.author_id}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
