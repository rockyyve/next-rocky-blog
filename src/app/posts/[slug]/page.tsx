import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { PostActions } from "@/app/_components/post-actions";
import { Metadata } from "next";

// 🎯 ISR 配置：每60秒重新验证一次
export const revalidate = 60;

// 🔄 动态 Metadata 生成（支持 ISR）
export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
  
  return {
    title: `${post.title} | Rocky Blog`,
    description: post.excerpt || `Read ${post.title} on Rocky Blog`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on Rocky Blog`,
      url: `${siteUrl}/posts/${post.slug}`,
      siteName: "Rocky Blog",
      images: [
        {
          url: post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Read ${post.title} on Rocky Blog`,
      images: [post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/og-default.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/posts/${post.slug}`,
    },
  };
}

// 🏗️ 静态路径生成（构建时生成常见路径，其他按需生成）
export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    
    // 只为前10篇文章生成静态路径，其他的通过 ISR 按需生成
    return slugs.slice(0, 10).map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function Post(props: Params) {
  const params = await props.params;
  
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  // 支持markdown渲染
  // const mdContent = markdownToHtml(post.content || "");

  return (
    <main>
      <Alert preview={post.preview} />
      <Container>
        <Header />
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
          />
          <PostActions 
            slug={post.slug}
            title={post.title}
            authorId={post.author_id}
          />
          <PostBody content={post?.content} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

