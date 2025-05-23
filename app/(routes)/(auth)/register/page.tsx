"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterCredentials } from "@/types/types";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/Providers";

export default function RegisterPage() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
  });
  const { setIsAuthenticated } = useAuth(); // Access the global state updater
  const router = useRouter(); // For navigation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // Save token and update global state only if token exists
      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true); // Update the global state
        toast.success("Registration successful");
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No token received from server. Please try logging in.");
      }
    } catch (error: any) {
      console.error("Registration failed", error.message);
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="gradient-background flex items-center justify-center h-[calc(100vh-4.6rem)] w-full">
      <div className="bg-black bg-opacity-75 text-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="font-roboto text-2xl font-bold text-center hover:scale-105 transition">
          REGISTER
        </h1>
        <input
          name="name"
          type="text"
          value={credentials.name}
          onChange={handleChange}
          placeholder="Enter Full Name"
          className="font-roboto w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500 outline-none"
        />
        <input
          name="email"
          type="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter Email"
          className="font-roboto w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500 outline-none"
        />
        <input
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter Password"
          className="font-roboto w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md placeholder-gray-400 focus:bg-gray-700 focus:border-gray-500 outline-none"
        />
        <button
          onClick={handleRegister}
          className="font-roboto mt-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md hover:bg-gray-800 hover:-translate-y-1 transition"
        >
          REGISTER
        </button>
        <p className="text-center text-gray-400 mt-4">
          Already a user?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
