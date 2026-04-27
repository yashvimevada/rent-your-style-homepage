import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/js/utils/supabaseClient";
import {
  fetchAllOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  toggleAvailability,
} from "@/js/services/outfits";
import { getAllBookings, updateBookingStatus } from "@/js/services/bookings";
import { toast } from "sonner";
import { ADMIN_EMAILS } from "@/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Calendar,
  Loader2,
  ShieldCheck,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  TrendingUp,
  IndianRupee,
  Clock,
} from "lucide-react";

type OutfitRow = {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  category: string;
  size_available: string[];
  image_url: string;
  available: boolean;
  created_at: string;
};

type BookingRow = {
  id: string;
  user_id: string;
  outfit_id: string;
  size: string;
  duration: number;
  total_price: number;
  deposit: number;
  delivery_date: string;
  return_date: string;
  delivery_address: string;
  city: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  payment_status: string;
  created_at: string;
  outfits: { id: string; name: string; image_url: string };
};

const emptyOutfit = {
  name: "",
  description: "",
  price_per_day: 0,
  category: "Wedding",
  size_available: ["S", "M", "L"],
  image_url: "",
  available: true,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [outfits, setOutfits] = useState<OutfitRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  // Determine active section from URL
  const getActiveSection = () => {
    if (location.pathname === "/admin/outfits") return "outfits";
    if (location.pathname === "/admin/bookings") return "bookings";
    return "overview";
  };
  const activeSection = getActiveSection();

  // Outfit form state
  const [showOutfitDialog, setShowOutfitDialog] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<OutfitRow | null>(null);
  const [outfitForm, setOutfitForm] = useState(emptyOutfit);
  const [sizesInput, setSizesInput] = useState("S, M, L");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<OutfitRow | null>(null);

  // Booking search
  const [bookingSearch, setBookingSearch] = useState("");

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      // Check Supabase auth first
      const { data: { user } } = await supabase.auth.getUser();
      if (user && ADMIN_EMAILS.includes(user.email || "")) {
        setIsAdmin(true);
        setAdminEmail(user.email || "");
      } else {
        // Fallback: check localStorage admin flag (set by admin login page)
        const localAdmin = localStorage.getItem("admin_authenticated");
        if (localAdmin && ADMIN_EMAILS.includes(localAdmin)) {
          setIsAdmin(true);
          setAdminEmail(localAdmin);
        }
      }
      setAuthChecked(true);
    };
    checkAdmin();
  }, []);

  // Load data
  useEffect(() => {
    if (!isAdmin || !authChecked) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [outfitsData, bookingsData] = await Promise.all([
          fetchAllOutfits(),
          getAllBookings(),
        ]);
        setOutfits(outfitsData || []);
        setBookings(bookingsData || []);
      } catch (error) {
        console.error("Failed to load admin data:", error);
        toast.error("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, authChecked]);

  // Outfit CRUD
  const openAddOutfit = () => {
    setEditingOutfit(null);
    setOutfitForm(emptyOutfit);
    setSizesInput("S, M, L");
    setShowOutfitDialog(true);
  };

  const openEditOutfit = (outfit: OutfitRow) => {
    setEditingOutfit(outfit);
    setOutfitForm({
      name: outfit.name,
      description: outfit.description,
      price_per_day: outfit.price_per_day,
      category: outfit.category,
      size_available: outfit.size_available,
      image_url: outfit.image_url,
      available: outfit.available,
    });
    setSizesInput(Array.isArray(outfit.size_available) ? outfit.size_available.join(", ") : "S, M, L");
    setShowOutfitDialog(true);
  };

  const handleSaveOutfit = async () => {
    if (!outfitForm.name.trim()) { toast.error("Name is required"); return; }
    if (outfitForm.price_per_day <= 0) { toast.error("Price must be > 0"); return; }

    setSaving(true);
    try {
      const formData = {
        ...outfitForm,
        size_available: sizesInput.split(",").map(s => s.trim()).filter(Boolean),
      };

      if (editingOutfit) {
        await updateOutfit(editingOutfit.id, formData);
        setOutfits(outfits.map(o => o.id === editingOutfit.id ? { ...o, ...formData } : o));
        toast.success("Outfit updated!");
      } else {
        const result = await createOutfit(formData);
        if (result && result[0]) {
          setOutfits([result[0], ...outfits]);
        }
        toast.success("Outfit added!");
      }
      setShowOutfitDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save outfit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOutfit = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOutfit(deleteTarget.id);
      setOutfits(outfits.filter(o => o.id !== deleteTarget.id));
      toast.success("Outfit deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete outfit.");
    }
    setDeleteTarget(null);
  };

  const handleToggleAvailability = async (outfit: OutfitRow) => {
    try {
      await toggleAvailability(outfit.id, !outfit.available);
      setOutfits(outfits.map(o => o.id === outfit.id ? { ...o, available: !outfit.available } : o));
      toast.success(`Outfit ${outfit.available ? "disabled" : "enabled"}!`);
    } catch (error) {
      toast.error("Failed to toggle availability.");
    }
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update booking status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "confirmed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "returned": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Not admin — redirect to admin login
  if (authChecked && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/40 mb-6">You don't have admin permissions.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/admin/login")} className="bg-gradient-to-r from-pink-500 to-purple-600">
              Admin Login
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Stats for overview
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const activeOutfits = outfits.filter(o => o.available).length;

  return (
    <AdminLayout adminEmail={adminEmail}>
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
        </div>
      ) : activeSection === "overview" ? (
        /* ======== OVERVIEW ======== */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-white/40 text-sm mt-1">Welcome back! Here's your store at a glance.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#1a1c27] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-sm text-white/40">Total Outfits</span>
              </div>
              <p className="text-3xl font-bold text-white">{outfits.length}</p>
              <p className="text-xs text-green-400 mt-1">{activeOutfits} active</p>
            </div>

            <div className="p-5 rounded-xl bg-[#1a1c27] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-white/40">Total Bookings</span>
              </div>
              <p className="text-3xl font-bold text-white">{bookings.length}</p>
              <p className="text-xs text-yellow-400 mt-1">{pendingBookings} pending</p>
            </div>

            <div className="p-5 rounded-xl bg-[#1a1c27] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm text-white/40">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-white/30 mt-1">All time</p>
            </div>

            <div className="p-5 rounded-xl bg-[#1a1c27] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-white/40">Confirmed</span>
              </div>
              <p className="text-3xl font-bold text-white">{confirmedBookings}</p>
              <p className="text-xs text-blue-400 mt-1">active rentals</p>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="rounded-xl bg-[#1a1c27] border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/bookings")}
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
              >
                View All →
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-white/40">Customer</TableHead>
                    <TableHead className="text-white/40">Outfit</TableHead>
                    <TableHead className="text-white/40">Amount</TableHead>
                    <TableHead className="text-white/40">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 5).map((booking) => (
                    <TableRow key={booking.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell className="text-white/80 text-sm">{booking.customer_name || "—"}</TableCell>
                      <TableCell className="text-white/60 text-sm">{booking.outfits?.name || "Unknown"}</TableCell>
                      <TableCell className="text-white/80 text-sm font-medium">₹{Number(booking.total_price).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(booking.status)} border text-xs`}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-white/30">No bookings yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : activeSection === "outfits" ? (
        /* ======== OUTFITS TAB ======== */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Manage Outfits</h1>
              <p className="text-white/40 text-sm mt-1">{outfits.length} outfits in catalog</p>
            </div>
            <Button onClick={openAddOutfit} className="bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Outfit
            </Button>
          </div>

          <div className="rounded-xl bg-[#1a1c27] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-white/40">Outfit</TableHead>
                    <TableHead className="text-white/40">Category</TableHead>
                    <TableHead className="text-white/40">Price/Day</TableHead>
                    <TableHead className="text-white/40">Sizes</TableHead>
                    <TableHead className="text-white/40">Available</TableHead>
                    <TableHead className="text-right text-white/40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outfits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-white/30">No outfits found.</TableCell>
                    </TableRow>
                  ) : (
                    outfits.map((outfit) => (
                      <TableRow key={outfit.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/[0.08] flex-shrink-0">
                              <img
                                src={outfit.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop&q=60"}
                                alt={outfit.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop&q=60"; }}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-white/90 line-clamp-1">{outfit.name}</div>
                              <div className="text-xs text-white/30 line-clamp-1 max-w-[200px]">{outfit.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/10 text-white/60">{outfit.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-white/90">₹{outfit.price_per_day}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(Array.isArray(outfit.size_available) ? outfit.size_available : []).map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 bg-white/[0.05] rounded text-white/50">{s}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={outfit.available}
                            onCheckedChange={() => handleToggleAvailability(outfit)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openEditOutfit(outfit)} className="text-white/50 hover:text-white hover:bg-white/[0.05]">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={() => setDeleteTarget(outfit)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        /* ======== BOOKINGS TAB ======== */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
            <p className="text-white/40 text-sm mt-1">{bookings.length} total bookings</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by customer name, email, or outfit..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 transition-all"
            />
          </div>

          <div className="rounded-xl bg-[#1a1c27] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-white/40">Customer</TableHead>
                    <TableHead className="text-white/40">Outfit</TableHead>
                    <TableHead className="text-white/40">Details</TableHead>
                    <TableHead className="text-white/40">Dates</TableHead>
                    <TableHead className="text-white/40">Delivery</TableHead>
                    <TableHead className="text-white/40">Amount</TableHead>
                    <TableHead className="text-white/40">Status</TableHead>
                    <TableHead className="text-right text-white/40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const searchTerm = bookingSearch.toLowerCase().trim();
                    const filtered = searchTerm
                      ? bookings.filter((b) =>
                          (b.customer_name || "").toLowerCase().includes(searchTerm) ||
                          (b.customer_email || "").toLowerCase().includes(searchTerm) ||
                          (b.outfits?.name || "").toLowerCase().includes(searchTerm) ||
                          (b.city || "").toLowerCase().includes(searchTerm)
                        )
                      : bookings;

                    if (filtered.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10 text-white/30">
                            {searchTerm ? `No bookings matching "${bookingSearch}"` : "No bookings found."}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return filtered.map((booking) => (
                      <TableRow key={booking.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                        <TableCell>
                          <div className="space-y-1 min-w-[160px]">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                              <span className="font-medium text-sm text-white/80">{booking.customer_name || "—"}</span>
                            </div>
                            {booking.customer_email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-white/20 flex-shrink-0" />
                                <span className="text-xs text-white/40 truncate max-w-[150px]" title={booking.customer_email}>{booking.customer_email}</span>
                              </div>
                            )}
                            {booking.customer_phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-white/20 flex-shrink-0" />
                                <span className="text-xs text-white/40">{booking.customer_phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white/80">{booking.outfits?.name || "Unknown"}</div>
                          <div className="text-xs text-white/30 truncate max-w-[120px]" title={booking.id}>#{booking.id.substring(0, 8)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-white/70">Size: {booking.size}</div>
                          <div className="text-sm text-white/40">{booking.duration} days</div>
                        </TableCell>
                        <TableCell>
                          {booking.delivery_date && (
                            <div className="text-sm text-white/70">
                              From: {new Date(booking.delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                          )}
                          {booking.return_date && (
                            <div className="text-sm text-white/40">
                              To: {new Date(booking.return_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[140px]">
                            {booking.city && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-white/70">{booking.city}</span>
                              </div>
                            )}
                            {booking.delivery_address && (
                              <div className="text-xs text-white/30 line-clamp-2 max-w-[180px]" title={booking.delivery_address}>{booking.delivery_address}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-pink-400">₹{Number(booking.total_price).toLocaleString("en-IN")}</div>
                          <div className="text-xs text-white/30">₹{Number(booking.deposit).toLocaleString("en-IN")} deposit</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(booking.status)} border text-xs`}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={booking.status}
                            onValueChange={(val) => handleBookingStatusChange(booking.id, val)}
                          >
                            <SelectTrigger className="w-[130px] ml-auto bg-white/[0.03] border-white/[0.08] text-white/70">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Outfit Dialog */}
      <Dialog open={showOutfitDialog} onOpenChange={setShowOutfitDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOutfit ? "Edit Outfit" : "Add New Outfit"}</DialogTitle>
            <DialogDescription>
              {editingOutfit ? "Update the outfit details below." : "Fill in the details to add a new outfit."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input value={outfitForm.name} onChange={(e) => setOutfitForm({ ...outfitForm, name: e.target.value })} placeholder="Outfit name" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={outfitForm.description} onChange={(e) => setOutfitForm({ ...outfitForm, description: e.target.value })} placeholder="Brief description" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Day (₹)</Label>
                <Input type="number" value={outfitForm.price_per_day} onChange={(e) => setOutfitForm({ ...outfitForm, price_per_day: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={outfitForm.category} onValueChange={(val) => setOutfitForm({ ...outfitForm, category: val })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Festive">Festive</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Sizes (comma-separated)</Label>
              <Input value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="S, M, L, XL" className="mt-1" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={outfitForm.image_url} onChange={(e) => setOutfitForm({ ...outfitForm, image_url: e.target.value })} placeholder="https://..." className="mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={outfitForm.available} onCheckedChange={(val) => setOutfitForm({ ...outfitForm, available: val })} />
              <Label>Available for rent</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowOutfitDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveOutfit} disabled={saving} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingOutfit ? "Update" : "Add"} Outfit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOutfit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
