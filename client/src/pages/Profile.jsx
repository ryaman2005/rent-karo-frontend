import { useNavigate } from "react-router-dom";
import { User, Mail, Tag, ArrowRight } from "lucide-react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-10 shadow-md"
        style={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-3xl font-black text-white"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <h1 className="text-2xl font-bold font-display" style={{ color: 'hsl(var(--foreground))' }}>
            {user.name}
          </h1>
          <span
            className="text-xs font-semibold uppercase tracking-wider mt-1 px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              color: 'hsl(var(--primary))',
            }}
          >
            {user.role || "User"}
          </span>
        </div>

        {/* Info Rows */}
        <div className="space-y-4 mb-8">
          <div
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
          >
            <User size={16} style={{ color: 'hsl(var(--primary))' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Full Name</p>
              <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{user.name}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
          >
            <Mail size={16} style={{ color: 'hsl(var(--primary))' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Email</p>
              <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{user.email}</p>
            </div>
          </div>
          {user.role && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
            >
              <Tag size={16} style={{ color: 'hsl(var(--primary))' }} />
              <div>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Account Type</p>
                <p className="font-semibold capitalize" style={{ color: 'hsl(var(--foreground))' }}>{user.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/browse")}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Browse Listings <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Profile;