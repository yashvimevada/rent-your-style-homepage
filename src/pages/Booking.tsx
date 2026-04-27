import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Wallet,
  Building2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { createBooking } from "@/js/services/bookings";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import LoginDialog from "@/components/LoginDialog";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop&q=80";

const paymentMethods = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI Payment", icon: Wallet },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
];

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");
  const [bookingRef, setBookingRef] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    deliveryDate: "",
    returnDate: "",
  });

  const outfitId = searchParams.get("id");
  const outfitName = searchParams.get("name") || "Unknown Outfit";
  const outfitSize = searchParams.get("size") || "M";
  const outfitDuration = searchParams.get("duration") || "3";
  const outfitPrice = parseInt(searchParams.get("price") || "0");
  const outfitDeposit = parseInt(searchParams.get("deposit") || "0");
  const outfitImage = searchParams.get("image") || "";
  const totalAmount = outfitPrice + outfitDeposit;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === "deliveryDate") {
      const start = new Date(e.target.value);
      start.setDate(start.getDate() + parseInt(outfitDuration));
      setFormData(prev => ({...prev, deliveryDate: e.target.value, returnDate: start.toISOString().split("T")[0]}));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) { toast.error("Please enter your full name"); return false; }
    if (!formData.email.trim() || !formData.email.includes("@")) { toast.error("Please enter a valid email"); return false; }
    if (!formData.phone.trim() || formData.phone.length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (!formData.address.trim()) { toast.error("Please enter your delivery address"); return false; }
    if (!formData.city.trim()) { toast.error("Please enter your city"); return false; }
    if (!formData.pincode.trim() || formData.pincode.length < 6) { toast.error("Please enter a valid pincode"); return false; }
    if (!formData.deliveryDate) { toast.error("Please select a delivery date"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");

    try {
      if (!outfitId) {
        toast.error("Missing outfit information. Please go back and try again.");
        setIsSubmitting(false);
        setPaymentStep("form");
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStep("success");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create booking in DB
      const result = await createBooking({
        outfit_id: outfitId,
        size: outfitSize,
        duration: parseInt(outfitDuration),
        total_price: totalAmount,
        deposit: outfitDeposit,
        delivery_date: formData.deliveryDate,
        return_date: formData.returnDate,
        delivery_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        city: formData.city,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        payment_status: "paid",
      });

      // Set booking reference
      if (result && result[0]) {
        setBookingRef(result[0].id.substring(0, 8).toUpperCase());
      }

      // Clear cart after successful booking
      clearCart();

      setIsBooked(true);
      toast.success("Payment successful! Booking confirmed.");
    } catch (error: any) {
      console.error("Failed to checkout:", error);
      setPaymentStep("form");
      toast.error(error.message || "Failed to complete your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center shadow-button">
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Booking <span className="gradient-text">Confirmed!</span>
              </h1>
              {bookingRef && (
                <p className="text-lg font-semibold text-primary mb-2">
                  Reference: #{bookingRef}
                </p>
              )}
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your outfit has been successfully booked. We've sent the
                confirmation details to your email.
              </p>

              <div className="p-6 rounded-2xl card-gradient border border-border shadow-card mb-8 text-left">
                <h3 className="font-display font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outfit</span>
                    <span className="font-medium">{outfitName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{outfitSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{outfitDuration} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Date</span>
                    <span className="font-medium">
                      {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-medium text-green-600">✓ Paid</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Paid</span>
                      <span className="font-bold gradient-text flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/dashboard")} className="gradient-bg shadow-button hover:opacity-90">
                  View My Bookings
                </Button>
                <Button onClick={() => navigate("/outfits")} variant="outline" className="border-primary/30 hover:bg-accent">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 animate-fade-in">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">Almost There!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Complete Your <span className="gradient-text">Booking</span>
            </h1>
            <p className="text-muted-foreground">Fill in your details to confirm your outfit rental</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="mt-1.5" />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Flat No., Building, Street" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Your city" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" className="mt-1.5" />
                    </div>
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Delivery Schedule
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Input id="deliveryDate" name="deliveryDate" type="date" min={getMinDate()} value={formData.deliveryDate} onChange={handleInputChange} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="returnDate">Expected Return</Label>
                      <Input id="returnDate" name="returnDate" type="date" disabled value={formData.returnDate} className="mt-1.5 bg-muted" />
                      <p className="text-xs text-muted-foreground mt-1">Auto-calculated for {outfitDuration} days</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
                  <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${paymentMethod === method.id ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                        <RadioGroupItem value={method.id} />
                        <method.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full text-lg py-6 rounded-xl gradient-bg shadow-button hover:opacity-90 transition-all duration-300 animate-fade-in flex justify-center items-center" style={{ animationDelay: "0.3s" }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Confirm Booking • ₹{totalAmount.toLocaleString("en-IN")}</>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>

                {(outfitImage || true) && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-border">
                    <img
                      src={outfitImage || PLACEHOLDER_IMAGE}
                      alt={outfitName}
                      className="w-full aspect-square object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-medium line-clamp-2">{outfitName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Size: {outfitSize} • {outfitDuration} Days</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Price</span>
                    <span className="font-medium flex items-center"><IndianRupee className="w-3.5 h-3.5" />{outfitPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span className="font-medium flex items-center"><IndianRupee className="w-3.5 h-3.5" />{outfitDeposit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Delivery</span>
                    <span className="font-medium">FREE</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold gradient-text flex items-center"><IndianRupee className="w-4 h-4" />{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">*Security deposit is refundable after outfit return</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Simulation Overlay */}
      {paymentStep !== "form" && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="p-8 rounded-2xl card-gradient border border-border shadow-card max-w-sm w-full mx-4 text-center animate-fade-in">
            {paymentStep === "processing" ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Processing Payment</h2>
                <p className="text-muted-foreground mb-4">
                  Processing your {paymentMethod === "card" ? "card" : paymentMethod === "upi" ? "UPI" : "net banking"} payment...
                </p>
                <div className="flex items-center justify-center gap-2 text-lg font-bold gradient-text">
                  <IndianRupee className="w-4 h-4" />
                  {totalAmount.toLocaleString("en-IN")}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2 text-green-600">Payment Successful!</h2>
                <p className="text-muted-foreground">Creating your booking...</p>
              </>
            )}
          </div>
        </div>
      )}

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={() => {
          setShowLoginDialog(false);
          toast.success("Logged in! You can now complete your booking.");
        }}
      />

      <Footer />
    </div>
  );
};

export default Booking;