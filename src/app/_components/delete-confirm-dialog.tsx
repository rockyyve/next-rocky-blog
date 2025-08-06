"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postSlug: string;
  onDeleteSuccess?: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  postTitle,
  postSlug,
  onDeleteSuccess
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/posts/${postSlug}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 删除成功
        onClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          // 默认行为：跳转到首页
          router.push('/');
          router.refresh();
        }
      } else {
        const error = await response.json();
        alert(`删除失败: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            确认删除文章
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            您确定要删除文章 <span className="font-semibold">"{postTitle}"</span> 吗？
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-6">
            此操作无法撤销，文章及其封面图片将被永久删除。
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            className="flex-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={isDeleting}
          >
            取消
          </button>
          <button
            type="button"
            className="flex-1 bg-red-600 border border-transparent rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                删除中...
              </span>
            ) : (
              '确认删除'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 