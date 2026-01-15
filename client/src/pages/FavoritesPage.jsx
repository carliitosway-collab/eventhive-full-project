import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiLoader, FiAlertTriangle } from "react-icons/fi";
import api from "../services/api.service";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

export default function FavoritesPage() {
  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = () => {
    if (!hasToken) {
      setIsLoading(false);
      setError("Necesitas login para ver tus favoritos.");
      return;
    }

    setIsLoading(true);
    setError("");

    api
      .get("/me/favorites")
      .then((res) => {
        setFavorites(res.data?.data || []);
      })
      .catch((err) => {
        console.log(err);
        setError(err?.response?.data?.message || "No pude cargar favoritos.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [favorites]);

  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>

        <p style={styles.muted}>
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>

        <p style={styles.error}>
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Link to="/events" style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>
        <p style={styles.subtitle}>{sortedFavorites.length} eventos guardados</p>
      </header>

      {sortedFavorites.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>Todavía no tienes favoritos.</p>
          <Link to="/events" style={{ ...styles.btn, textDecoration: "none", display: "inline-flex" }}>
            Ver eventos
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {sortedFavorites.map((ev) => {
            const dateText = ev?.date ? new Date(ev.date).toLocaleString() : "Sin fecha";
            return (
              <Link key={ev._id} to={`/events/${ev._id}`} style={styles.cardLink}>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>{ev.title}</h3>
                  <p style={styles.cardMeta}>{ev.location || "Sin ubicación"}</p>
                  <p style={styles.cardMeta}>{dateText}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 900, margin: "0 auto" },
  backLink: { display: "inline-block", marginBottom: 12, textDecoration: "none", opacity: 0.8 },
  h1: { margin: "0 0 6px", fontSize: 42 },
  subtitle: { margin: 0, opacity: 0.7, fontSize: 16 },
  muted: { opacity: 0.75 },
  error: { color: "crimson" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 },
  cardLink: { textDecoration: "none", color: "inherit" },
  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },
  cardTitle: { margin: "0 0 8px", fontSize: 18 },
  cardMeta: { margin: 0, opacity: 0.75, fontSize: 14 },
  btn: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 600,
  },
};
