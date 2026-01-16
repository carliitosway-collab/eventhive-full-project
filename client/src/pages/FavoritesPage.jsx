import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiLoader, FiAlertTriangle, FiX } from "react-icons/fi";

import favoritesService from "../services/favorites.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = () => {
    setIsLoading(true);
    setError("");

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFavorites(data);
      })
      .catch((err) => {
        console.log(err);
        setError(err?.response?.data?.message || "No pude cargar favoritos.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [favorites]);

  const handleRemoveFavorite = (eventId) => {
    const previous = favorites;
    setFavorites((prev) => prev.filter((ev) => ev._id !== eventId));

    favoritesService.removeFavorite(eventId).catch((err) => {
      console.log(err);
      setFavorites(previous);
      setError("No pude quitar el favorito. Intenta de nuevo.");
    });
  };

  return (
    <PageLayout>
      <Link to="/events" className="link link-hover inline-flex items-center gap-2 opacity-80">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">
          <IconText icon={FiHeart}>Favorites</IconText>
        </h1>
        {!isLoading && !error && (
          <p className="opacity-70 mt-2">{sortedFavorites.length} eventos guardados</p>
        )}
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      ) : error ? (
        <div className="space-y-3">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>

          <button type="button" onClick={fetchFavorites} className="btn btn-outline btn-sm">
            Reintentar
          </button>
        </div>
      ) : sortedFavorites.length === 0 ? (
        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <p className="opacity-75">Todavía no tienes favoritos.</p>

            <div className="card-actions">
              <Link to="/events" className="btn btn-primary">
                Ver eventos
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedFavorites.map((ev) => (
            <div key={ev._id} className="relative">
              <button
                type="button"
                className="btn btn-xs btn-outline rounded-full absolute top-3 right-3 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFavorite(ev._id);
                }}
                aria-label="Quitar de favoritos"
                title="Quitar de favoritos"
              >
                <IconText icon={FiX} className="gap-1">
                  Quitar
                </IconText>
              </button>

              <EventCard event={ev} />
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
