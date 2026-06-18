"use server";

import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type LoginState = { error?: "noenv" | "creds" };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv()) return { error: "noenv" };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "creds" };

  redirect("/");
}
