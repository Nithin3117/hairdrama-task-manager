"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Hairdrama Task Manager
        </h1>

        <p className="mt-2 text-gray-600">
          Manage and assign your tasks easily.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </main>
  );
}