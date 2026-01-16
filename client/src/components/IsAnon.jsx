import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

function IsAnon({ children }) {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 opacity-80">
          <span className="loading loading-spinner" />
          <span>Cargando…</span>
        </div>
      </div>
    );
  }

  if (isLoggedIn) return <Navigate to="/" />;

  return children;
}

export default IsAnon;
