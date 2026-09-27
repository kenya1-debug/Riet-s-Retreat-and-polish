"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-gold/20 bg-onyx p-8">
        <p className="font-display text-2xl text-cream">
          Riet&rsquo;s <span className="text-gold">Admin</span>
        </p>
        <p className="mt-2 font-sans text-sm text-cream/50">Staff sign-in only</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="block font-sans text-sm text-cream/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 font-sans text-sm text-cream focus:border-gold"
            />
          </div>
          <div>
            <label className="block font-sans text-sm text-cream/70">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 font-sans text-sm text-cream focus:border-gold"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 border border-red-800/50 bg-red-950/30 px-4 py-3 font-sans text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-gold px-6 py-3 font-sans text-sm text-ink hover:bg-gold-soft disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
