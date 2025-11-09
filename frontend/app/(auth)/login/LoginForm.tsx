"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login } from "@/app/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const id = toast.loading("Logging in…");
    setBusy(true);
    try {
      const res = await login(email, password);
      const token = res?.accessToken ?? res?.token ?? localStorage.getItem("token");
      if (!token) throw new Error("No token returned by server");
      toast.success("Logged in");
      router.push("/todos");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Login failed");
    } finally {
      toast.dismiss(id);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full h-12 rounded-lg border border-gray-300 px-4 text-sm
                     placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full h-12 rounded-lg border border-gray-300 px-4 pr-12 text-sm
                     placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500" />
          <span>Remember me</span>
        </label>
        <a href="#" className="underline">Forgot password?</a>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 text-lg text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-all disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
