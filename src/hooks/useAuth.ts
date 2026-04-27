import { useState, useEffect } from "react";
import { supabase } from "@/js/utils/supabaseClient";
import type { User } from "@supabase/supabase-js";

export const ADMIN_EMAILS = ["yashvimevada23@gmail.com"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || "");

  return {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin,
  };
}
