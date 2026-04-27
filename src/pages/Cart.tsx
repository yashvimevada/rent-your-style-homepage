import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, IndianRupee, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop&q=80";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, getTotal, loading } = useCart();

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const totals = getTotal();

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Your Cart is <span className="gradient-text">Empty</span>
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your cart is empty. Browse outfits to rent.
              </p>
              <Button
                onClick={() => navigate("/outfits")}
                className="gradient-bg shadow-button hover:opacity-90"
              >
                Browse Outfits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Review Your Selection
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Your Rental <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "outfit" : "outfits"} ready for booking
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in flex flex-col sm:flex-row gap-4"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Outfit Image */}
                  <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  {/* Outfit Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-accent text-sm font-medium">
                          Size: {item.size}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-accent text-sm font-medium">
                          {item.duration} Days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-lg font-bold gradient-text">
                        <IndianRupee className="w-4 h-4" />
                        {item.price.toLocaleString("en-IN")}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="sticky top-24 p-6 rounded-2xl card-gradient border border-border shadow-card animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <h2 className="font-display font-semibold text-lg mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Total</span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {totals.rental.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {totals.deposit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Delivery Charges</span>
                    <span className="font-medium">FREE</span>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Grand Total</span>
                      <span className="font-bold gradient-text flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {totals.grand.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Security deposit is refundable after outfit return
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const firstItem = items[0];
                    const params = new URLSearchParams({
                      cartId: firstItem.id,
                      id: firstItem.outfitId,
                      name: firstItem.name,
                      size: firstItem.size,
                      duration: firstItem.duration.toString(),
                      price: totals.rental.toString(),
                      deposit: totals.deposit.toString(),
                      image: firstItem.image,
                    });
                    navigate(`/booking?${params.toString()}`);
                  }}
                  className="w-full mt-6 gradient-bg shadow-button hover:opacity-90"
                  size="lg"
                >
                  Proceed to Booking
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;