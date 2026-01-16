import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import PageLayout from "../layouts/PageLayout";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword || !cleanName) {
      setErrorMessage("Email, password y name son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    authService
      .signup({ email: cleanEmail, password: cleanPassword, name: cleanName })
      .then(() => navigate("/login"))
      .catch((error) => {
        const msg = error?.response?.data?.message || "Signup failed";
        setErrorMessage(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black mb-2">Sign Up</h1>
        <p className="opacity-70 mb-6">Crea tu cuenta para guardar favoritos y apuntarte a eventos.</p>

        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <form onSubmit={handleSignupSubmit} className="grid gap-4">
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
                  required
                  disabled={isSubmitting}
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
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Name</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isSubmitting}
                />
              </label>

              {errorMessage && (
                <div className="alert alert-error">
                  <span>{errorMessage}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Create account"}
              </button>

              <p className="text-sm opacity-80">
                Already have an account?{" "}
                <Link className="link link-hover font-semibold" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
