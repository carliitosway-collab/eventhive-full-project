import { Routes, Route } from "react-router-dom";
import IsPrivate from "./components/IsPrivate";
import IsAnon from "./components/IsAnon";
import Navbar from "./components/Navbar";
import "./index.css";

// Pages
import HomePage from "./pages/HomePage";
import EventsListPage from "./pages/EventsListPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import NewEventPage from "./pages/NewEventPage";
import EditEventPage from "./pages/EditEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import AttendingPage from "./pages/AttendingPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />

        {/* Solo NO logueados */}
        <Route
          path="/signup"
          element={
            <IsAnon>
              <SignupPage />
            </IsAnon>
          }
        />
        <Route
          path="/login"
          element={
            <IsAnon>
              <LoginPage />
            </IsAnon>
          }
        />

        {/* Privadas */}
        <Route
          path="/events/new"
          element={
            <IsPrivate>
              <NewEventPage />
            </IsPrivate>
          }
        />
        <Route
          path="/events/edit/:eventId"
          element={
            <IsPrivate>
              <EditEventPage />
            </IsPrivate>
          }
        />
        <Route
          path="/my-events"
          element={
            <IsPrivate>
              <MyEventsPage />
            </IsPrivate>
          }
        />
        <Route
          path="/attending"
          element={
            <IsPrivate>
              <AttendingPage />
            </IsPrivate>
          }
        />
        <Route
          path="/favorites"
          element={
            <IsPrivate>
              <FavoritesPage />
            </IsPrivate>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
