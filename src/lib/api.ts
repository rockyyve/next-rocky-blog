import { Post } from "@/interfaces/post";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { unstable_cache } from 'next/cache';

// 🏷️ 缓存标签常量
const CACHE_TAGS = {
  POSTS: 'posts',
  POST: 'post',
  AUTHORS: 'authors'
} as const;

// 📦 缓存配置
const CACHE_CONFIG = {
  posts: {
    revalidate: 300, // 5分钟
    tags: [CACHE_TAGS.POSTS]
  },
  post: {
    revalidate: 60, // 1分钟
    tags: [CACHE_TAGS.POST]
  }
};

export async function getPostSlugs(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const getCachedSlugs = unstable_cache(
    async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('slug')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching post slugs:', error);
        return [];
      }

      return posts?.map(post => post.slug) || [];
    },
    ['post-slugs'],
    {
      revalidate: CACHE_CONFIG.posts.revalidate,
      tags: CACHE_CONFIG.posts.tags
    }
  );

  return getCachedSlugs();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);


  const getCachedPost = unstable_cache(
    async (postSlug: string) => {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:authors(name, picture)
        `)
        .eq('slug', postSlug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return null;
      }

      if (!post) return null;

      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        coverImage: post.cover_image,
        author: post.author || { name: post.author_name, picture: post.author_picture },
        excerpt: post.excerpt,
        ogImage: {
          url: post.og_image_url
        },
        content: post.content,
        preview: post.preview || false,
        author_id: post.author_id
      };
    },
    [`post-${slug}`],
    {
      revalidate: CACHE_CONFIG.post.revalidate,
      tags: [...CACHE_CONFIG.post.tags, `post-${slug}`]
    }
  );

  return getCachedPost(slug);
}

export async function getAllPosts(): Promise<Post[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const getCachedPosts = unstable_cache(
    async () => {

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:authors(name, picture)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      if (!posts) return [];

      return posts.map(post => ({
        slug: post.slug,
        title: post.title,
        date: post.date,
        coverImage: post.cover_image,
        author: post.author || { name: post.author_name, picture: post.author_picture },
        excerpt: post.excerpt,
        ogImage: {
          url: post.og_image_url
        },
        content: post.content,
        preview: post.preview || false,
        author_id: post.author_id
      }));
    },
    ['all-posts'],
    {
      revalidate: CACHE_CONFIG.posts.revalidate,
      tags: CACHE_CONFIG.posts.tags
    }
  );

  return getCachedPosts();
}

// 🔄 添加用于触发重新验证的函数
export async function triggerRevalidation(type: 'post' | 'posts', slug?: string) {
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  
  // 🌐 智能检测部署环境的 baseUrl
  const getBaseUrl = () => {
    // 优先使用手动设置的 NEXT_PUBLIC_SITE_URL
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    
    // Vercel 自动提供的 URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // 其他部署平台的 URL 检测
    if (process.env.DEPLOY_URL) {
      return process.env.DEPLOY_URL;
    }
    
    // 开发环境回退
    return 'https://next-rocky-blog-pjni02op2-mistyrainxys-projects.vercel.app';
  };
  
  const baseUrl = getBaseUrl();

  if (!revalidateSecret) {
    console.warn('⚠️ REVALIDATE_SECRET not set');
    return;
  }

  try {
    let url = `${baseUrl}/api/revalidate?secret=${revalidateSecret}`;
    
    if (type === 'post' && slug) {
      url += `&slug=${slug}`;
    } else if (type === 'posts') {
      url += '&path=/';
    }

    const response = await fetch(url, { method: 'POST' });
    const result = await response.json();
    
    console.log('🔄 Revalidation result:', result);
    return result;
  } catch (error) {
    console.error('❌ Revalidation failed:', error);
  }
}

// 可选：添加创建新文章的函数
export async function createPost(postData: Omit<Post, 'slug'>): Promise<Post | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 生成slug（简单实现）
  const slug = postData.title.toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      slug,
      title: postData.title,
      date: postData.date,
      cover_image: postData.coverImage,
      excerpt: postData.excerpt,
      og_image_url: postData.ogImage.url,
      content: postData.content,
      preview: postData.preview || false,
      // 如果使用单表结构，添加：
      // author_name: postData.author.name,
      // author_picture: postData.author.picture,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return data ? await getPostBySlug(slug) : null;
}

// 🗑️ 删除文章
export async function deletePost(slug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 首先获取文章信息以验证权限
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id, cover_image')
      .eq('slug', slug)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching post for deletion:', fetchError);
      return false;
    }

    // 删除文章
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return false;
    }

    // 如果有封面图片，尝试删除（可选，因为图片可能被其他文章使用）
    if (post.cover_image) {
      try {
        // 提取文件路径
        const url = new URL(post.cover_image);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `covers/${fileName}`;

        await supabase.storage
          .from('rkbucket')
          .remove([filePath]);
      } catch (imageError) {
        console.warn('Could not delete cover image:', imageError);
        // 不影响文章删除的成功
      }
    }

    // 触发 ISR 重新验证
    await triggerRevalidation('posts');

    return true;
  } catch (error) {
    console.error('Unexpected error deleting post:', error);
    return false;
  }
}
