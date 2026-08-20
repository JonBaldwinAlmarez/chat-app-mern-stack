import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
This page needs to: collect email/password, call login() from AuthContext,
 show an error if it fails, and redirect to the chat page on success.
*/

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // holds a message to show if login fails
  const [isSubmitting, setIsSubmitting] = useState(false); // disables the button while the request is in flight, so a user can't spam

  const { login } = useAuth();
  const navigate = useNavigate(); // React Router's way of redirecting the user programmatically after a successful login

  /* Submit Handler */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent Default
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Log in</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p>{email}</p>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p>{password}</p>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in...." : "log in"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
