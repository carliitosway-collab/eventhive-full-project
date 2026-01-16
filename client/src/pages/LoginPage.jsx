import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import authService from "../services/auth.service";
import PageLayout from "../layouts/PageLayout";

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
        const token =
          response?.data?.authToken ||
          response?.data?.token ||
          response?.data?.jwt ||
          response?.data;

        if (!token || typeof token !== "string") {
          throw new Error("Token missing in login response");
        }

        storeToken(token);
        return authenticateUser();
      })
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
        const msg = error?.response?.data?.message || error?.message || "Login failed";
        setErrorMessage(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black mb-2">Login</h1>
        <p className="opacity-70 mb-6">Entra para crear eventos, apuntarte y guardar favoritos.</p>

        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <form onSubmit={handleLoginSubmit} className="grid gap-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Email</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Password</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </label>

              {errorMessage && (
                <div className="alert alert-error">
                  <span>{errorMessage}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Login"}
              </button>

              <p className="text-sm opacity-80">
                No account yet?{" "}
                <Link className="link link-hover font-semibold" to="/signup">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
