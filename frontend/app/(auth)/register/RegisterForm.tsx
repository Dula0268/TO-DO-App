"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { register as apiRegister } from "@/app/lib/api";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Full name is required";

    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";

    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Use at least 6 characters";

    if (!confirm) e.confirm = "Confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const id = toast.loading("Creating account…");
    setBusy(true);
    try {
      await apiRegister(name, email, password);
      toast.success("Registration successful. Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Registration failed");
    } finally {
      toast.dismiss(id);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <input
          id="name"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full h-12 rounded-lg border border-gray-300 px-4 text-sm placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full h-12 rounded-lg border border-gray-300 px-4 text-sm placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full h-12 rounded-lg border border-gray-300 px-4 pr-12 text-sm placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            aria-label={showPwd ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <div className="relative">
          <input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="block w-full h-12 rounded-lg border border-gray-300 px-4 pr-12 text-sm placeholder:text-gray-500 outline-purple-500 bg-white shadow-sm"
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirm && <p id="confirm-error" className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 text-lg text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-all disabled:opacity-60"
      >
        {busy ? "Creating account…" : "Register"}
      </button>
    </form>
  );
}
