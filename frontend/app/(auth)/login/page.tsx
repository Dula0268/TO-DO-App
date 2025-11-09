"use client";

import LoginForm from "@/app/(auth)/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-purple-400 flex items-center justify-center overflow-hidden">
      {/* floating shapes */}
      <div className="absolute w-60 h-60 rounded-xl bg-purple-300 -top-5 -left-16 rotate-45 hidden md:block" />
      <div className="absolute w-48 h-48 rounded-xl bg-purple-300 -bottom-6 -right-10 rotate-12 hidden md:block" />
      <div className="absolute w-40 h-40 bg-purple-300 rounded-full top-0 right-12 hidden md:block" />
      <div className="absolute w-20 h-40 bg-purple-300 rounded-full bottom-20 left-10 rotate-45 hidden md:block" />

      {/* card with BIG inner padding */}
      <section className="relative z-20 w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl">
          <header className="text-center px-8 pt-10">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Sign in to continue to Todo App
            </p>
          </header>

          {/* >>> this wrapper guarantees inputs don't kiss the edge <<< */}
          <div className="px-8 md:px-12 py-10">
            <LoginForm />
          </div>

          <footer className="px-8 md:px-12 pb-10 -mt-3">
            <p className="text-center text-sm text-gray-700">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline">Create one now</a>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
