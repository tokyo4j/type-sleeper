import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const Login = () => {
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
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
      <table>
        <tbody>
          <tr>
            <td>user code</td>
            <td>
              <input
                onChange={(e) => setUserCode(e.currentTarget.value)}
              ></input>
            </td>
          </tr>
          <tr>
            <td>password</td>
            <td>
              <input
                type="password"
                onChange={(e) => setPassword(e.currentTarget.value)}
              ></input>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <button>submit</button>
              {error}
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
