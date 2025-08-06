"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import "easymde/dist/easymde.min.css";
import { createClient } from "@/utils/supabase/client";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = { 
  id: "", 
  title: "", 
  content: "", 
  coverImage: "",
  excerpt: ""
};

export default function CreatePost() {
  const [post, setPost] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { title, content, excerpt } = post;
  const router = useRouter();

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPost((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const onContentChange = useCallback((value: string) => {
    console.log("🚀 ~ onContentChange ~ value:", value)
    setPost((prev) => ({ ...prev, content: value }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('rkbucket')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        alert('上传失败，请重试');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('rkbucket')
        .getPublicUrl(data.path);

      setPost((prev) => ({ ...prev, coverImage: publicUrl }));
      setImagePreview(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const removeImage = useCallback(() => {
    setPost((prev) => ({ ...prev, coverImage: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 稳定的SimpleMDE配置
  const simpleMDEOptions = useMemo(() => ({
    placeholder: "Write your post content here...",
    spellChecker: false,
    status: false,
  }), []);

  async function createNewPost() {
    if (!title || !content) {
      alert('请填写标题和内容');
      return;
    }
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      const id = uuid();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const postData = { 
        title, 
        content, 
        excerpt: excerpt || content.substring(0, 160) + '...', // Auto-generate excerpt if not provided
        cover_image: post.coverImage || null,
        author_id: user.id, 
        id: id,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: slug
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        alert('创建文章失败，请重试');
        return;
      }

      router.push(`/posts/${data.slug}`);
    } catch (error) {
      console.error("Error:", error);
      alert('创建文章失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <Container>
        <Header />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-8">
            Create New Post
          </h1>
          <div className="space-y-6">
            {/* Title Input */}
            <input
              onChange={onChange}
              name="title"
              placeholder="Enter your post title..."
              value={post.title}
              className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 border-gray-300 focus:border-gray-500 transition-colors"
            />

            {/* Excerpt Input */}
            <textarea
              onChange={onChange}
              name="excerpt"
              placeholder="Enter a brief excerpt (optional)..."
              value={post.excerpt}
              rows={3}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:border-gray-500 transition-colors resize-none"
            />

            {/* Cover Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                封面图片 (可选)
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                    id="cover-image"
                  />
                  <label
                    htmlFor="cover-image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-gray-600">
                      {isUploading ? "上传中..." : "点击选择封面图片"}
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      支持 JPG、PNG 格式，最大 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className="min-h-96">
              <SimpleMDE
                key="create-post-editor"
                value={post.content}
                onChange={onContentChange}
                options={simpleMDEOptions}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={createNewPost}
                disabled={!title || !content || isLoading || isUploading}
              >
                {isLoading ? "Creating..." : "Create Post"}
              </button>
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-2 rounded-lg transition-colors"
                onClick={() => router.push("/")}
                disabled={isLoading || isUploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
} 