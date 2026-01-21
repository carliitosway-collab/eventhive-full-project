import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import PageLayout from "../layouts/PageLayout";
import { FiLoader } from "react-icons/fi";

function IsPrivate({ children }) {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center gap-3 opacity-80">
          <FiLoader className="animate-spin" />
          <span>Cargando…</span>
        </div>
      </PageLayout>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" />;

  return children;
}

export default IsPrivate;
