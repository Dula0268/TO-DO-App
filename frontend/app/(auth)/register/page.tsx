"use client";

import RegisterForm from "@/app/(auth)/register/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen bg-purple-400 flex items-center justify-center overflow-hidden">
      {/* floating shapes (same as login) */}
      <div className="absolute w-60 h-60 rounded-xl bg-purple-300 -top-5 -left-16 rotate-45 hidden md:block" />
      <div className="absolute w-48 h-48 rounded-xl bg-purple-300 -bottom-6 -right-10 rotate-12 hidden md:block" />
      <div className="absolute w-40 h-40 bg-purple-300 rounded-full top-0 right-12 hidden md:block" />
      <div className="absolute w-20 h-40 bg-purple-300 rounded-full bottom-20 left-10 rotate-45 hidden md:block" />

      {/* card */}
      <section className="relative z-20 w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl">
          <header className="text-center px-8 pt-10">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Join Todo App and start organizing
            </p>
          </header>

          {/* inset content so inputs never touch the edge */}
          <div className="px-8 md:px-12 py-10">
            <RegisterForm />
          </div>

          <footer className="px-8 md:px-12 pb-10 -mt-3">
            <p className="text-center text-sm text-gray-700">
              Already have an account?{" "}
              <a href="/login" className="underline">Sign in</a>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
