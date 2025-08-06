import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/login/logout-button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function ProtectedPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase.auth.getClaims();
  
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{data.claims.email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
