"use client";
import React, { useState } from "react";
import api, { login } from "@/app/lib/api"; // use shared login helper
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // this field holds the user's email
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{email?:string,password?:string}>({});

  function validate() {
    const e: any = {};
    if (!email.trim()) e.email = "Email is required";
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) e.email = "A valid email address is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    try {
  const toastId = toast.loading("Logging in...");
  // Use the centralized login helper which stores the token correctly
  const res = await login(email, password);
      toast.dismiss(toastId);
      // api.login stores token in localStorage; still check for accessToken
      const token = res?.accessToken ?? res?.token ?? localStorage.getItem('token');
      if (!token) {
        toast.error("No token returned by server");
        return;
      }
      toast.success("Logged in");
      router.push("/todos");
    } catch (err:any) {
      console.error(err);
      const message = err?.response?.data?.message ?? err.message ?? "Login failed";
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login
        </button>
      </div>
    </form>
  );
}