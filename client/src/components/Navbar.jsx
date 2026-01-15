import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>

        {isLoggedIn && (
          <>
            <Link to="/my-events">My Events</Link>
            <Link to="/attending">Attending</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/events/new">New Event</Link>
          </>
        )}
      </div>

      <div style={styles.right}>
        {isLoggedIn ? (
          <>
            <span style={styles.user}>
              <FiUser />
              {user?.name || "User"}
            </span>

            <button onClick={logOutUser} style={styles.logoutBtn}>
              <FiLogOut />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #ddd",
    gap: 12,
  },
  left: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  right: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  user: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
  },
  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #ccc",
    background: "white",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
