"use client";
import React, { useState } from "react";
import api from "@/app/lib/api"; // or import axios directly
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState(""); // or email
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{username?:string,password?:string}>({});

  function validate() {
    const e: any = {};
    if (!username.trim()) e.username = "Username/email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const toastId = toast.loading("Logging in...");
      const res = await api.post("/auth/login", { username, password });
      toast.dismiss(toastId);
      const token = res.data?.token ?? res.data?.accessToken;
      if (!token) {
        toast.error("No token returned by server");
        return;
      }
      localStorage.setItem("token", token);
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
            Username or Email
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter your username or email"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-600">{errors.username}</p>
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