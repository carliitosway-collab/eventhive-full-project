import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import authService from "../services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Email y password son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    authService
      .login({ email: cleanEmail, password: cleanPassword })
      .then((response) => {
        // ✅ soporta varias formas de respuesta del backend
        const token =
          response?.data?.authToken ||
          response?.data?.token ||
          response?.data?.jwt ||
          response?.data;

        if (!token || typeof token !== "string") {
          throw new Error("Token missing in login response");
        }

        storeToken(token);

        // ✅ fuerza a que el contexto se actualice antes de navegar
        return authenticateUser();
      })
      .then(() => {
        navigate("/"); // o "/events" si prefieres
      })
      .catch((error) => {
        console.log(error);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Login failed";
        setErrorMessage(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 10 }}>Login</h1>

      <form
        onSubmit={handleLoginSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 360 }}
      >
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Login"}
        </button>
      </form>

      {errorMessage && <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>}

      <p style={{ marginTop: 12 }}>
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
