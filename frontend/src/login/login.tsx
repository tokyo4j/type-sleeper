import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";

const Login = () => {
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex justify-center items-center bg-sky-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl mb-6 text-center font-semibold text-gray-800">Login</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const { token } = (await fetch("http://localhost:8080/login", {
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_code: userCode, password }),
                method: "POST",
              }).then((res) => res.json())) as { token: string };

              setError("");

              document.cookie = `token=${token}`;
              document.location.href = "/";
            } catch {
              setError("Login failed");
            }
          }}
        >
          <div className="mb-4">
            <label htmlFor="user-code" className="block text-gray-700 text-sm font-medium mb-2">
              User Code
            </label>
            <input
              id="user-code"
              type="text"
              className="w-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter your user code"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-md py-2 px-4 text-sm font-semibold uppercase tracking-wide focus:outline-none focus:bg-blue-600 hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
