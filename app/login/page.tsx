// app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-black">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-black"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
