import Navbar from "../components/Navbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />
      {children}
    </div>
  );
}
