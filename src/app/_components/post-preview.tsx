"use client";

import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
  author_id?: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  author_id,
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // 监听认证状态变化
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 检查当前用户是否是文章作者
  const isAuthor = user && author_id && user.id === author_id;

  return (
    <div className="p-6">
      <div className="mb-4 overflow-hidden rounded-lg">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          
          {/* 编辑和删除按钮 - 仅对文章作者显示 */}
          {!loading && isAuthor && (
            <div className="ml-3 flex gap-2">
              <Link
                href={`/edit/${slug}`}
                className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-md transition-colors duration-200"
                title="编辑文章"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
                编辑
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 text-sm font-medium rounded-md transition-colors duration-200"
                title="删除文章"
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                删除
              </button>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <DateFormatter dateString={date} />
        </div>
        
        <p 
          className="text-gray-700 dark:text-gray-300 leading-relaxed"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {excerpt}
        </p>
        
        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        postTitle={title}
        postSlug={slug}
        onDeleteSuccess={() => {
          // 删除成功后刷新页面
          router.refresh();
        }}
      />
    </div>
  );
}
