"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Mode = "sign-in" | "sign-up";

const SupabaseAuthForm = () => {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const postAuthPath = "/mentors";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push(postAuthPath);
      router.refresh();
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName.trim() || email.split("@")[0],
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(postAuthPath);
      router.refresh();
      setLoading(false);
      return;
    }

    setMessage(
      "Account created. If email confirmation is enabled, check your inbox before signing in."
    );
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <article className="w-full max-w-[420px] text-center mx-auto">
      <p className="text-3xl font-medium text-gray-900 mb-3">mentor.ai</p>
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
        {mode === "sign-in" ? "Login to your account" : "Create an Account"}
      </h1>
      <p className="text-lg text-gray-400 mb-8">
        {mode === "sign-in"
          ? "Sign in to continue your AI learning journey."
          : "Sign up to start learning with your AI tutor."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {mode === "sign-up" && (
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
        )}

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        />

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "sign-in" ? "Enter your password" : "Create a password"}
            required
            minLength={6}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-11 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          className="w-full h-12 rounded-2xl border border-violet-600 bg-gradient-to-b from-violet-500 to-indigo-600 text-white text-lg font-semibold shadow-[0_6px_18px_rgba(109,40,217,0.32)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(109,40,217,0.42)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "sign-in" ? "Log in" : "Sign up"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-transparent px-3 text-gray-400 font-semibold">or authorize with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full h-12 flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-4 text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4" />
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853" />
          <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.8299 3.96409 7.29V4.9581H0.957273C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05" />
          <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9259L15.0218 2.3445C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335" />
        </svg>
        {googleLoading ? "Redirecting..." : "Google"}
      </button>

      <button
        type="button"
        className="text-sm mt-6 text-gray-400 cursor-pointer"
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setError(null);
          setMessage(null);
        }}
      >
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account? <span className="font-semibold text-gray-900">Sign up</span>
          </>
        ) : (
          <>
            Already have an account? <span className="font-semibold text-gray-900">Sign in</span>
          </>
        )}
      </button>
    </article>
  );
};

export default SupabaseAuthForm;
