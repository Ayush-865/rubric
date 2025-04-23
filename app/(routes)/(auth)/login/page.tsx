import { LoginCredentials } from "@/types/types";
import React from "react";

const page = () => {
  const [credentials, setCredentials] = React.useState<LoginCredentials>({
    email: "",
    password: "",
  });

  return (
    <div className="h-screen w-screen flex items-center justify-center gradient-background">
      <div className="login">
        <h1>LOGIN</h1>
        <input
          className="inputBox"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
        />
        <input
          className="inputBox"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />
        <button className="loginbutton" type="button" onClick={handleLogin}>
          LOGIN UP
        </button>
      </div>
    </div>
  );
};

export default page;
