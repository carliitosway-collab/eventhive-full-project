import { createContext, useMemo, useState } from "react";

const LangContext = createContext();

const DICT = {
  en: {
    langLabel: "EN",
    // Nav (si ya los tienes, ok; si no, no pasa nada)
    navHome: "Home",
    navEvents: "Events",
    navMyEvents: "My Events",
    navAttending: "Attending",
    navFavorites: "Favorites",
    navNewEvent: "New Event",
    login: "Login",
    logout: "Logout",
    signup: "Signup",
    menu: "Menu",

    // Events list
    eventsTitle: "Events",
    eventsSubtitle: "Discover public events and join in one click.",
    refresh: "Refresh",
    searchPlaceholder: "Search title, location, description...",
    search: "Search",
    filters: "Filters",
    clear: "Clear",
    sort: "Sort",
    soonest: "Soonest",
    latest: "Latest",
    from: "From",
    to: "To",
    apply: "Apply",
    tip: "Tip: search first, then narrow by dates.",
    loading: "Loading events…",
    errorLoad: "Could not load events. Please check if the backend is running.",
    retry: "Retry",
    empty: "No events found.",
    showing: "Showing",
    of: "of",
    page: "Page",
    caughtUp: "You are all caught up.",
    loadMore: "Load more",

    // Chips
    query: "Query",

    // Cards
    public: "Public",
    private: "Private",
    noDate: "No date",
    noDesc: "No description",
    noLocation: "No location",
    viewDetails: "View details",
  },
  es: {
    langLabel: "ES",
    // Nav
    navHome: "Inicio",
    navEvents: "Eventos",
    navMyEvents: "Mis eventos",
    navAttending: "Asistiendo",
    navFavorites: "Favoritos",
    navNewEvent: "Nuevo evento",
    login: "Entrar",
    logout: "Salir",
    signup: "Registro",
    menu: "Menú",

    // Events list
    eventsTitle: "Eventos",
    eventsSubtitle: "Descubre eventos públicos y apúntate en un clic.",
    refresh: "Recargar",
    searchPlaceholder: "Buscar por título, ubicación, descripción...",
    search: "Buscar",
    filters: "Filtros",
    clear: "Limpiar",
    sort: "Orden",
    soonest: "Próximos",
    latest: "Recientes",
    from: "Desde",
    to: "Hasta",
    apply: "Aplicar",
    tip: "Tip: busca primero y luego filtra por fechas.",
    loading: "Cargando eventos…",
    errorLoad: "No pude cargar eventos. Revisa si el backend está corriendo.",
    retry: "Reintentar",
    empty: "No se encontraron eventos.",
    showing: "Mostrando",
    of: "de",
    page: "Página",
    caughtUp: "Ya no hay más.",
    loadMore: "Cargar más",

    // Chips
    query: "Búsqueda",

    // Cards
    public: "Público",
    private: "Privado",
    noDate: "Sin fecha",
    noDesc: "Sin descripción",
    noLocation: "Sin ubicación",
    viewDetails: "Ver detalles",
  },
};

function LangProviderWrapper({ children }) {
  const [lang, setLang] = useState("en");

  const value = useMemo(() => {
    const t = DICT[lang] || DICT.en;

    const toggleLang = () => {
      setLang((prev) => (prev === "en" ? "es" : "en"));
    };

    return { lang, setLang, toggleLang, t };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export { LangContext, LangProviderWrapper };
