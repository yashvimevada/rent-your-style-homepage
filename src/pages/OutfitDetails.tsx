import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  Truck,
  ShieldCheck,
  Heart,
  Share2,
  AlertCircle,
  Check,
  Clock,
  Ban,
  Sparkles,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { getOutfitById } from "@/js/services/outfits";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import LoginDialog from "@/components/LoginDialog";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop&q=80";

const rentalDurations = [
  { days: 3, label: "3 Days", multiplier: 1 },
  { days: 5, label: "5 Days", multiplier: 1.5 },
  { days: 7, label: "7 Days", multiplier: 2 },
];

const rentalPolicies = [
  {
    icon: ShieldCheck,
    title: "Security Deposit",
    description: "A refundable security deposit is required before delivery. Deposit will be returned within 3-5 business days after outfit inspection.",
  },
  {
    icon: AlertCircle,
    title: "Damage & Stains",
    description: "Charges will apply for damage, stains, or missing items. Please handle the outfit with care.",
  },
  {
    icon: Clock,
    title: "Late Returns",
    description: "Late return will result in extra daily charges at 20% of the daily rental rate.",
  },
  {
    icon: Check,
    title: "Acceptable Wear",
    description: "Minor wear from normal use is acceptable, but major damage such as tears, burns, or permanent stains will be charged.",
  },
];

const OutfitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin } = useAuth();
  const { addItem } = useCart();

  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState(rentalDurations[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "book" | null>(null);

  useEffect(() => {
    const fetchOutfit = async () => {
      if (!id) return;
      try {
        const data = await getOutfitById(id);
        setOutfit(data);
      } catch (error: any) {
        console.error("Failed to fetch outfit details:", error);
        toast.error("Failed to load outfit details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">
              Outfit Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The outfit you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/outfits")} className="gradient-bg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Outfits
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAvailable = outfit.available !== false;
  const sizes = Array.isArray(outfit.size_available) ? outfit.size_available : [outfit.size_available];
  const price = outfit.price_per_day;
  const occasion = outfit.category || "Designer";
  const outfitImage = (!outfit.image_url || imageError) ? PLACEHOLDER_IMAGE : outfit.image_url;

  // Calculate prices
  const rentalPrice = Math.round(price * selectedDuration.multiplier);
  const securityDeposit = Math.round(price * 0.5);
  const totalAmount = rentalPrice + securityDeposit;

  const handleBookNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the rental terms and damage policy");
      return;
    }

    if (!isLoggedIn) {
      setPendingAction("book");
      setShowLoginDialog(true);
      return;
    }

    const params = new URLSearchParams({
      id: outfit.id,
      name: outfit.name,
      size: selectedSize,
      duration: selectedDuration.days.toString(),
      price: rentalPrice.toString(),
      deposit: securityDeposit.toString(),
      image: outfit.image_url || "",
    });

    navigate(`/booking?${params.toString()}`);
  };

  const performAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(outfit.id, selectedSize, selectedDuration.days);
      toast.success("Added to your rental cart!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add to cart. Try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!isLoggedIn) {
      setPendingAction("cart");
      setShowLoginDialog(true);
      return;
    }

    await performAddToCart();
  };

  const handleLoginSuccess = () => {
    if (pendingAction === "cart") {
      performAddToCart();
    } else if (pendingAction === "book") {
      // Re-trigger booking after login
      const params = new URLSearchParams({
        id: outfit.id,
        name: outfit.name,
        size: selectedSize,
        duration: selectedDuration.days.toString(),
        price: rentalPrice.toString(),
        deposit: securityDeposit.toString(),
        image: outfit.image_url || "",
      });
      navigate(`/booking?${params.toString()}`);
    }
    setPendingAction(null);
  };

  const handleAddToWishlist = () => {
    toast.success("Added to wishlist!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/outfits")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 animate-fade-in"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Outfits
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden card-gradient border border-border shadow-card sticky top-24">
                <img
                  src={outfitImage}
                  alt={outfit.name}
                  className="w-full aspect-[3/4] object-cover"
                  onError={() => setImageError(true)}
                />
                <Badge className="absolute top-4 left-4 gradient-bg text-primary-foreground border-0 shadow-button">
                  {occasion}
                </Badge>

                {/* Out of Stock Overlay */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge className="bg-destructive text-destructive-foreground border-0 text-lg px-6 py-3 shadow-lg flex items-center gap-2">
                      <Ban className="w-5 h-5" />
                      Out of Stock
                    </Badge>
                  </div>
                )}

                {/* Action buttons on image */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleAddToWishlist}
                    className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors"
                  >
                    <Heart className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-8">
              <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <p className="text-sm text-muted-foreground mb-2">
                  Collection • {occasion}
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
                  {outfit.name}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {outfit.description}
                </p>

                {/* Availability status */}
                {!isAvailable && (
                  <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-destructive font-medium flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      This outfit is currently out of stock
                    </p>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <p className="text-sm font-medium mb-3">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 ${selectedSize === size
                          ? "gradient-bg text-primary-foreground border-transparent shadow-button"
                          : "bg-background border-border hover:border-primary/50"
                        } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <p className="text-sm font-medium mb-3">Rental Duration</p>
                <div className="flex flex-wrap gap-3">
                  {rentalDurations.map((duration) => (
                    <button
                      key={duration.days}
                      onClick={() => setSelectedDuration(duration)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 ${selectedDuration.days === duration.days
                          ? "gradient-bg text-primary-foreground border-transparent shadow-button"
                          : "bg-background border-border hover:border-primary/50"
                        } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Calendar className="w-4 h-4 inline-block mr-2" />
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="animate-fade-in p-6 rounded-2xl bg-accent/50 border border-border" style={{ animationDelay: "0.25s" }}>
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Price Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Rental ({selectedDuration.label})
                    </span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {rentalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Security Deposit (Refundable)
                    </span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {securityDeposit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold gradient-text flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Policies */}
              <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-primary" />
                  Rental Policies
                </h3>
                <div className="grid gap-4">
                  {rentalPolicies.map((policy) => (
                    <div
                      key={policy.title}
                      className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg gradient-bg flex items-center justify-center shadow-button">
                        <policy.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{policy.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {policy.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition-colors">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    disabled={!isAvailable}
                    className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <span className="font-medium text-primary">rental terms</span> and{" "}
                    <span className="font-medium text-primary">damage policy</span>. I understand that I am responsible for the outfit during the rental period and will be charged for any damages or late returns.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="animate-fade-in space-y-3" style={{ animationDelay: "0.4s" }}>
                <div className="flex gap-3">
                  {!isAdmin && (
                    <Button
                      onClick={handleAddToCart}
                      size="lg"
                      variant="outline"
                      disabled={!selectedSize || isAdding || !isAvailable}
                      className="flex-1 text-lg py-6 rounded-xl border-primary/30 hover:bg-accent transition-all duration-300"
                    >
                      {isAdding ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 mr-2" />
                      )}
                      Add to Cart
                    </Button>
                  )}
                  <Button
                    onClick={handleBookNow}
                    size="lg"
                    disabled={!agreedToTerms || !selectedSize || !isAvailable}
                    className={`flex-1 text-lg py-6 rounded-xl transition-all duration-300 ${agreedToTerms && selectedSize && isAvailable
                        ? "gradient-bg shadow-button hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                  >
                    {isAvailable ? `Book Now • ₹${totalAmount.toLocaleString("en-IN")}` : "Out of Stock"}
                  </Button>
                </div>
                {isAvailable && (!agreedToTerms || !selectedSize) && (
                  <p className="text-xs text-muted-foreground text-center">
                    {!selectedSize
                      ? "Please select a size to continue"
                      : "Please agree to the terms to continue"}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Flexible Dates</p>
                    <p className="text-xs text-muted-foreground">Easy scheduling</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">At your doorstep</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Quality Checked</p>
                    <p className="text-xs text-muted-foreground">Professionally cleaned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer />
    </div>
  );
};

export default OutfitDetails;