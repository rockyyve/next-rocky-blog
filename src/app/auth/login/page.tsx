import { LoginForm } from '@/components/login/login-form'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>
      
      {/* 装饰性几何图案 */}
      <div className="absolute inset-0 opacity-10">
        {/* 大圆圈装饰 */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-2xl"></div>
        
        {/* 博客主题装饰元素 */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-indigo-500 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-40 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-700"></div>
        
        {/* 文字装饰线条 */}
        <div className="absolute top-32 left-16 w-20 h-0.5 bg-blue-300 opacity-30 rotate-12"></div>
        <div className="absolute top-36 left-20 w-16 h-0.5 bg-blue-300 opacity-30 rotate-12"></div>
        <div className="absolute top-40 left-18 w-12 h-0.5 bg-blue-300 opacity-30 rotate-12"></div>
        
        <div className="absolute bottom-32 right-16 w-20 h-0.5 bg-purple-300 opacity-30 -rotate-12"></div>
        <div className="absolute bottom-36 right-20 w-16 h-0.5 bg-purple-300 opacity-30 -rotate-12"></div>
        <div className="absolute bottom-40 right-18 w-12 h-0.5 bg-purple-300 opacity-30 -rotate-12"></div>
      </div>
      
      {/* 博客图标装饰 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        {/* 笔记本图标装饰 */}
        <div className="absolute top-24 left-1/4 text-6xl">📝</div>
        <div className="absolute bottom-24 right-1/4 text-5xl">💭</div>
        <div className="absolute top-1/3 right-16 text-4xl">✍️</div>
        <div className="absolute bottom-1/3 left-16 text-4xl">📚</div>
      </div>
      
      {/* 主内容区域 */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        {/* 登录表单容器，添加背景模糊和阴影 */}
        <div className="w-full max-w-sm">
          {/* 博客标题装饰 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <span className="text-2xl">📖</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Rocky Blog
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share your thoughts with the world
            </p>
          </div>
          
          {/* 登录表单背景 */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-white/20">
            <LoginForm />
          </div>
        </div>
      </div>
      
      {/* 底部装饰波浪 */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}