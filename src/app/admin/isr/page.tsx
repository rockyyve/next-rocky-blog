'use client';

import { useState } from 'react';

export default function ISRDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const revalidate = async (type: string, slug?: string) => {
    setLoading(true);
    try {
      let url = `/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`;
      
      if (type === 'post' && slug) {
        url += `&slug=${slug}`;
      } else if (type === 'home') {
        url += '&path=/';
      }

      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult(data); // Keep consistent with success case since data will contain error info from API
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ISR 控制面板</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => revalidate('home')}
          disabled={loading}
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          🏠 重新验证首页
        </button>
        
        <button
          onClick={() => revalidate('posts')}
          disabled={loading}
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          📚 重新验证所有文章
        </button>
        
        <div className="p-4 border rounded">
          <input
            type="text"
            placeholder="文章 slug"
            className="w-full p-2 border rounded mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                revalidate('post', (e.target as HTMLInputElement).value);
              }
            }}
          />
          <div className="text-sm text-gray-600">按 Enter 重新验证特定文章</div>
        </div>
      </div>

      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">结果:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 

function data(prevState: null): null {
    throw new Error('Function not implemented.');
}
