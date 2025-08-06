import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  const slug = request.nextUrl.searchParams.get('slug');

  // 验证密钥
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    if (path) {
      // 重新验证特定路径
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
    } else if (slug) {
      // 重新验证特定文章
      revalidatePath(`/posts/${slug}`);
      revalidatePath('/'); // 同时重新验证首页
      console.log(`✅ Revalidated post: ${slug}`);
    } else {
      // 重新验证首页
      revalidatePath('/');
      console.log('✅ Revalidated homepage');
    }

    return NextResponse.json({ 
      revalidated: true, 
      message: 'Revalidation successful',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('❌ Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

// 支持 GET 请求用于简单测试
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Revalidate API is working',
    usage: {
      revalidatePath: 'POST /api/revalidate?secret=xxx&path=/posts/example-post',
      revalidatePost: 'POST /api/revalidate?secret=xxx&slug=example-post',
      revalidateHome: 'POST /api/revalidate?secret=xxx'
    }
  });
} 