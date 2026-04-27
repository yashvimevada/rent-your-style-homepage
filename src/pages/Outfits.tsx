import { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OutfitFilters from "@/components/OutfitFilters";
import OutfitCard from "@/components/OutfitCard";
import OutfitCardSkeleton from "@/components/OutfitCardSkeleton";
import { fetchOutfits } from "@/js/services/outfits";
import { toast } from "sonner";

const Outfits = () => {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const data = await fetchOutfits();
        setOutfits(data || []);
        // Set max price range from data
        if (data && data.length > 0) {
          const maxPrice = Math.max(...data.map((o: any) => o.price_per_day || 0));
          setPriceRange([0, maxPrice + 500]);
        }
      } catch (error: any) {
        console.error("Failed to load outfits:", error);
        toast.error("Could not load outfits from database.");
      } finally {
        setLoading(false);
      }
    };

    loadOutfits();
  }, []);

  const maxPrice = useMemo(() => {
    if (outfits.length === 0) return 10000;
    return Math.max(...outfits.map((o) => o.price_per_day || 0)) + 500;
  }, [outfits]);

  // Filter outfits based on selected filters
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      // Search by name
      const matchesSearch =
        searchQuery === "" ||
        outfit.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOccasion =
        selectedOccasion === "All" || outfit.category === selectedOccasion || outfit.occasion === selectedOccasion;
      
      // Size filter
      const sizesArray = Array.isArray(outfit.size_available) 
        ? outfit.size_available 
        : (outfit.size_available ? [outfit.size_available] : []);
        
      const matchesSize =
        selectedSize === "All" || sizesArray.includes(selectedSize);

      // Price filter
      const price = outfit.price_per_day || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesOccasion && matchesSize && matchesPrice;
    });
  }, [outfits, selectedOccasion, selectedSize, searchQuery, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Premium Collection
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
              Browse Available{" "}
              <span className="gradient-text">Outfits</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our curated collection of designer outfits for weddings,
              parties, and special occasions. Rent the look you love.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <OutfitFilters
              selectedOccasion={selectedOccasion}
              selectedSize={selectedSize}
              searchQuery={searchQuery}
              priceRange={priceRange}
              maxPrice={maxPrice}
              onOccasionChange={setSelectedOccasion}
              onSizeChange={setSelectedSize}
              onSearchChange={setSearchQuery}
              onPriceRangeChange={setPriceRange}
            />
          </div>

          {/* Results Count */}
          <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredOutfits.length}
              </span>{" "}
              {filteredOutfits.length === 1 ? "outfit" : "outfits"}
            </p>
          </div>

          {/* Outfits Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <OutfitCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredOutfits.map((outfit, index) => (
                <div
                  key={outfit.id}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <OutfitCard outfit={{
                    id: outfit.id.toString(),
                    name: outfit.name,
                    description: outfit.description,
                    price: outfit.price_per_day,
                    image: outfit.image_url,
                    category: outfit.category || "Women",
                    occasion: outfit.category,
                    duration: "per day",
                    sizes: Array.isArray(outfit.size_available) ? outfit.size_available : [outfit.size_available],
                    available: outfit.available !== false,
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-xl text-muted-foreground mb-4">
                No outfits found matching your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedOccasion("All");
                  setSelectedSize("All");
                  setSearchQuery("");
                  setPriceRange([0, maxPrice]);
                }}
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Outfits;