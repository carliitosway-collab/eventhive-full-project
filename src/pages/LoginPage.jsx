import { useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAtSign,
  FiLock,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";

import { AuthContext } from "../context/auth.context";
import authService from "../services/auth.service";
import PageLayout from "../layouts/PageLayout";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const isFormDisabled = useMemo(() => isSubmitting, [isSubmitting]);

  const emailTouched = email.length > 0;
  const passwordTouched = password.length > 0;

  const emailOk = !emailTouched || isValidEmail(email);
  const passwordOk = !passwordTouched || password.length >= 6;

  const canSubmit =
    isValidEmail(email) && password.length >= 6 && !isSubmitting;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
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
      .then(() => navigate("/profile"))
      .catch((error) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please try again.";
        setErrorMessage(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-base-200 to-base-100">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center animate-[fadeInUp_220ms_ease-out]">
            <h1 className="text-4xl font-black leading-tight">Login</h1>
            <p className="opacity-70 mt-2">
              Sign in to create events, attend, and save favorites.
            </p>
          </div>

          <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-md transition hover:shadow-lg border-t-4 border-t-primary animate-[fadeInUp_260ms_ease-out]">
            <div className="card-body gap-5">
              <form onSubmit={handleLoginSubmit} className="grid gap-4">
                {/* Email */}
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-semibold">Email</span>
                  </div>

                  <div
                    className={[
                      "flex items-center gap-2 input input-bordered w-full",
                      emailOk ? "" : "input-error",
                    ].join(" ")}
                  >
                    <FiAtSign className="opacity-70" />
                    <input
                      className="w-full bg-transparent outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isFormDisabled}
                    />
                  </div>

                  {!emailOk && (
                    <div className="mt-2 text-xs opacity-70">
                      Please enter a valid email address.
                    </div>
                  )}
                </label>

                {/* Password */}
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-semibold">Password</span>
                    <span className="label-text-alt">
                      <Link className="link link-hover" to="#">
                        Forgot password?
                      </Link>
                    </span>
                  </div>

                  <div
                    className={[
                      "flex items-center gap-2 input input-bordered w-full",
                      passwordOk ? "" : "input-error",
                    ].join(" ")}
                  >
                    <FiLock className="opacity-70" />
                    <input
                      className="w-full bg-transparent outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="At least 6 characters"
                      disabled={isFormDisabled}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isFormDisabled}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {!passwordOk && (
                    <div className="mt-2 text-xs opacity-70">
                      Password must be at least 6 characters.
                    </div>
                  )}
                </label>

                {errorMessage && (
                  <div className="alert alert-error">
                    <FiAlertTriangle />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="
                    btn w-full btn-lg font-semibold
                    bg-primary text-primary-content
                    shadow-md hover:shadow-lg
                    hover:bg-primary-focus
                    transition
                    active:scale-[0.98]
                  "
                >
                  {isSubmitting ? (
                    "Logging in..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Login <FiArrowRight />
                    </span>
                  )}
                </button>

                <p className="text-sm opacity-80 text-center">
                  No account yet?{" "}
                  <Link
                    className="link link-primary font-semibold"
                    to="/signup"
                  >
                    Sign up
                  </Link>
                </p>
              </form>

              <style>
                {`
                  @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}
              </style>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
