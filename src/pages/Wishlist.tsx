import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingBag, ArrowLeft, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/js/utils/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop&q=80";

interface WishlistOutfit {
  id: string;
  name: string;
  image: string;
  price: number;
  occasion: string;
  duration: string;
  sizes: string[];
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [outfits, setOutfits] = useState<WishlistOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      if (wishlist.length === 0) {
        setOutfits([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("outfits")
          .select("id, name, image, price, occasion, duration, sizes")
          .in("id", wishlist);

        if (error) throw error;
        setOutfits(data || []);
      } catch (err) {
        console.error("Failed to fetch wishlist outfits:", err);
        setOutfits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOutfits();
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                My Wishlist
              </h1>
              <p className="text-gray-500 mt-1">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {wishlist.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="text-gray-500 hover:text-rose-500 hover:border-rose-300 rounded-full"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-rose-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Save the outfits you love! Tap the ♥ icon on any outfit to add it here.
              </p>
              <Button
                onClick={() => navigate("/outfits")}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 font-semibold shadow-lg shadow-rose-200"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Outfits
              </Button>
            </div>
          ) : (
            /* Wishlist Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={outfit.image || PLACEHOLDER_IMAGE}
                      alt={outfit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                    {/* Occasion Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full">
                      {outfit.occasion}
                    </span>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(outfit.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-rose-50 transition-colors group/btn"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      onClick={() => navigate(`/outfit/${outfit.id}`)}
                      className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-rose-500 transition-colors"
                    >
                      {outfit.name}
                    </h3>
                    <div className="flex items-center gap-1 text-lg font-bold text-rose-500 mb-3">
                      <IndianRupee className="w-4 h-4" />
                      {outfit.price?.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-gray-400 ml-1">/ {outfit.duration}</span>
                    </div>

                    {/* Sizes */}
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {(outfit.sizes || []).slice(0, 4).map((size) => (
                        <span key={size} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                          {size}
                        </span>
                      ))}
                    </div>

                    <Button
                      onClick={() => navigate(`/outfit/${outfit.id}`)}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm"
                    >
                      View & Rent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back link */}
          {wishlist.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                to="/outfits"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Browsing
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
