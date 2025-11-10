'use client';
import { useRouter } from 'next/navigation';
import { FaRedo } from 'react-icons/fa';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white text-center">
      <h1 className="text-7xl font-bold mb-6 drop-shadow-lg">500</h1>
      <p className="text-2xl mb-8">Something went wrong on our end. Please try again later.</p>

      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-purple-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <FaRedo />
        Retry
      </button>
    </div>
  );
}
