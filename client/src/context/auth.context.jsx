import { createContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext();

function AuthProviderWrapper({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const storeToken = (token) => localStorage.setItem("authToken", token);
  const removeToken = () => localStorage.removeItem("authToken");

  const authenticateUser = () => {
    setIsLoading(true);

    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return Promise.resolve();
    }

    return authService
      .verify()
      .then((response) => {
        // Tu backend devuelve req.payload en response.data
        setIsLoggedIn(true);
        setUser(response.data);
      })
      .catch((err) => {
        // ✅ si token inválido/expirado -> limpiar TODO
        console.log("verify failed:", err?.response?.status);
        removeToken();
        setIsLoggedIn(false);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  };

  const logOutUser = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  useEffect(() => {
    authenticateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        storeToken,
        authenticateUser,
        logOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProviderWrapper, AuthContext };
