"use client";

import React, { useState, createContext, useContext } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

// Create a context for authentication
const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (auth: boolean) => {},
});

export const useAuth = () => useContext(AuthContext);

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    console.log("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { background: "#363636", color: "#fff" },
        }}
      />
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      {children}
    </AuthContext.Provider>
  );
};

export default Providers;
