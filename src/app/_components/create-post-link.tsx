"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/login/logout-button";

export function CreatePostLink() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <Link 
        href="/auth/login"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Login to Create
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/create"
        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        ✏️ Create Post
      </Link>
      <LogoutButton />
    </div>
  );
} 