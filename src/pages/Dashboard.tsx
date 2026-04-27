import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  IndianRupee,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUserBookings, cancelBooking } from "@/js/services/bookings";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop&q=80";

type BookingItem = {
  id: string;
  outfit_id: string;
  size: string;
  duration: number;
  total_price: number;
  deposit: number;
  delivery_date: string;
  return_date: string;
  status: string;
  payment_status: string;
  created_at: string;
  outfits: {
    id: string;
    name: string;
    image_url: string;
    price_per_day: number;
    category: string;
  };
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
    case "confirmed":
      return { label: "Confirmed", icon: CheckCircle2, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    case "returned":
      return { label: "Returned", icon: RotateCcw, color: "bg-green-500/10 text-green-600 border-green-500/20" };
    case "cancelled":
      return { label: "Cancelled", icon: XCircle, color: "bg-red-500/10 text-red-600 border-red-500/20" };
    default:
      return { label: status, icon: AlertCircle, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getUserBookings();
        setBookings(data || []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        toast.error("Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      loadBookings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking.");
    }
  };

  const activeBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const pastBookings = bookings.filter(b => b.status === "returned" || b.status === "cancelled");
  const displayedBookings = activeTab === "active" ? activeBookings : pastBookings;

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Login Required</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
            <Button onClick={() => navigate("/login")} className="gradient-bg shadow-button">
              Go to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Page Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">My Rentals</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Track your bookings and manage your rentals</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="p-4 rounded-xl card-gradient border border-border text-center">
              <p className="text-2xl font-bold gradient-text">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </div>
            <div className="p-4 rounded-xl card-gradient border border-border text-center">
              <p className="text-2xl font-bold text-yellow-600">{activeBookings.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="p-4 rounded-xl card-gradient border border-border text-center">
              <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === "returned").length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="p-4 rounded-xl card-gradient border border-border text-center">
              <p className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status === "cancelled").length}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === "active" ? "gradient-bg text-primary-foreground shadow-button" : "bg-accent text-muted-foreground hover:text-foreground"}`}
            >
              Active Bookings ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === "past" ? "gradient-bg text-primary-foreground shadow-button" : "bg-accent text-muted-foreground hover:text-foreground"}`}
            >
              Past Bookings ({pastBookings.length})
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold mb-2">
                {activeTab === "active" ? "No Active Bookings" : "No Past Bookings"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {activeTab === "active" ? "You don't have any active bookings yet." : "You haven't completed any bookings yet."}
              </p>
              <Button onClick={() => navigate("/outfits")} className="gradient-bg shadow-button">
                Browse Outfits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={booking.id}
                    className="p-4 sm:p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in flex flex-col sm:flex-row gap-4"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={booking.outfits?.image_url || PLACEHOLDER_IMAGE}
                        alt={booking.outfits?.name || "Outfit"}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display font-semibold text-lg line-clamp-1">
                            {booking.outfits?.name || "Unknown Outfit"}
                          </h3>
                          <Badge className={`${statusConfig.color} border shrink-0 flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                          <span>Size: <span className="text-foreground font-medium">{booking.size}</span></span>
                          <span>Duration: <span className="text-foreground font-medium">{booking.duration} days</span></span>
                          {booking.delivery_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Delivery: <span className="text-foreground font-medium">{new Date(booking.delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </span>
                          )}
                          {booking.return_date && (
                            <span className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              Return: <span className="text-foreground font-medium">{new Date(booking.return_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-lg font-bold gradient-text">
                          <IndianRupee className="w-4 h-4" />
                          {Number(booking.total_price).toLocaleString("en-IN")}
                        </div>

                        {booking.status === "pending" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancel(booking.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Yes, Cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
