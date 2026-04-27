import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, LogOut, User, LayoutDashboard, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/js/utils/supabaseClient";
import { logout } from "@/js/services/auth";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Outfits", href: "/outfits" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
        : "bg-white/80 backdrop-blur-sm border-b border-gray-100/50"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img 
              src="/logo.png" 
              alt="WardrobeX" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-rose-500"
                    : "text-gray-700 hover:text-rose-500"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-rose-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-1">
            {/* Search */}
            <button 
              onClick={() => navigate("/outfits")}
              className="p-2.5 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-1">
                <Link to="/dashboard">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </button>
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100">
                  <User className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-semibold text-gray-800 max-w-[80px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 font-semibold shadow-md shadow-rose-200 hover:shadow-lg transition-all">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: right icons */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-[16px] h-[16px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    isActive(link.href)
                      ? "text-rose-500 bg-rose-50"
                      : "text-gray-700 hover:text-rose-500 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-2">
                      <User className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-gray-800">{displayName}</span>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-rose-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-rose-500 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold">
                      Login / Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
