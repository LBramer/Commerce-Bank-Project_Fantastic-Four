import { useState } from "react";
import "./Login.css";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      localStorage.setItem("userId", userId);
      setIsLoggedIn(true);
      navigate("/urls");

    } catch (err) {
      console.error(err);
      setError("Failed to login/register. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">Login</h2>

            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>

            {error && <p className="error-message">{error}</p>}
          </form>
        ) : (
          <div className="welcome-message">
            <h2>Welcome!</h2>
            <p>You are now logged in.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
