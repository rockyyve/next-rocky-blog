import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 获取文章信息并验证所有权
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id, cover_image, title')
      .eq('slug', slug)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' }, 
        { status: 404 }
      );
    }

    // 验证用户是否是文章作者
    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' }, 
        { status: 403 }
      );
    }

    // 删除文章
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug)
      .eq('author_id', user.id); // 双重验证

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete post' }, 
        { status: 500 }
      );
    }

    // 删除封面图片（如果存在）
    if (post.cover_image) {
      try {
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

    // 重新验证相关页面
    revalidatePath('/');
    revalidatePath(`/posts/${slug}`);

    return NextResponse.json(
      { 
        message: 'Post deleted successfully',
        deletedPost: {
          slug,
          title: post.title
        }
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 