import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Calendar,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/js/services/auth";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
  adminEmail?: string;
}

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Outfits", href: "/admin/outfits", icon: Package },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
];

const AdminLayout = ({ children, adminEmail }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const displayName = adminEmail?.split("@")[0] || "Admin";

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] bg-[#13151d] border-r border-white/[0.06] flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">RYS Admin</h1>
            <p className="text-[10px] text-white/40 leading-none">Rent Your Style</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Management
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-white border border-pink-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-pink-400" : "text-white/40 group-hover:text-white/70"}`} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-pink-400/60" />}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Quick Links
            </p>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group"
            >
              <Store className="w-[18px] h-[18px] text-white/40 group-hover:text-white/70" />
              View Storefront
            </Link>
          </div>
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-[11px] text-white/40 truncate">{adminEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 h-9 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#13151d] border-r border-white/[0.06] flex flex-col animate-slide-in-left">
            {/* Brand */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-sm font-bold text-white">RYS Admin</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-white border border-pink-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] ${active ? "text-pink-400" : "text-white/40"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/[0.06]">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 h-9 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center h-16 px-4 lg:px-8 border-b border-white/[0.06] bg-[#13151d]/80 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-3 text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">{adminEmail}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {displayName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0f1117] p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
