import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sign } from "crypto";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Submit Handler
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent initial loading
    setError("");
    setIsSubmitting(true);

    try {
      await signup(userName, email, password);
      navigate("/chat");
    } catch (error) {
      console.error(error);
      setError("Could not create account. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Sign up</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(() => e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(() => e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(() => e.target.value)}
            required
          />
        </div>
        <button type="button">
          {isSubmitting ? "Creating Account" : "Sign up"}
        </button>
      </form>
      <p>
        Already Have An Account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
