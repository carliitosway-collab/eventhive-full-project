export default function UserProfileCard({ user }) {
  const name = user?.name || "—";
  const email = user?.email || "—";
  const initial = (name !== "—" ? name : email).trim().charAt(0) || "U";

  return (
    <div className="card bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl shadow-sm max-w-lg mx-auto">
      <div className="card-body gap-6 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-700 flex items-center justify-center font-black uppercase">
            {initial}
          </div>

          <div className="min-w-0">
            <div className="text-sm opacity-70">Name</div>
            <div className="text-2xl font-black truncate">{name}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm opacity-70">Email</div>
          <div className="text-base break-words">{email}</div>
        </div>
      </div>
    </div>
  );
}
