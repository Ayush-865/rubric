"use client";
import { LoginCredentials } from "@/types/types";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };


  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.error);
        return;
      }
  
      // Store token, redirect, or update state
      localStorage.setItem("token", data.token);
      console.log("Login successful", data);
      // Optionally redirect
      // router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      alert("Something went wrong.");
    }
  };
  

  return (
    <div className="gradient-background flex items-center justify-center h-[calc(100vh-4.6rem)]">
      <div className="bg-black bg-opacity-75 text-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md">
        <h1 className="font-roboto text-2xl font-bold text-center hover:scale-105 transition">
          LOGIN
        </h1>
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
          onClick={handleLogin}
          className="font-roboto mt-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md hover:bg-gray-800 hover:-translate-y-1 transition"
        >
          LOGIN
        </button>
        <p className="text-center text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
