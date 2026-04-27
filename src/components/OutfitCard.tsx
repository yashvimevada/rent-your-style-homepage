import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, IndianRupee, Heart, ShoppingBag, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Outfit } from "@/data/outfits";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop&q=80";

interface OutfitCardProps {
  outfit: Outfit & { available?: boolean };
}

const OutfitCard = ({ outfit }: OutfitCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(outfit.id);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isAvailable = outfit.available !== false;

  const handleViewDetails = () => {
    navigate(`/outfit/${outfit.id}`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(outfit.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
  };

  const imageSrc = (!outfit.image || imageError) ? PLACEHOLDER_IMAGE : outfit.image;

  return (
    <div className={`group relative rounded-2xl overflow-hidden glass-card hover-lift hover-glow transition-all duration-500 animate-fade-in ${!isAvailable ? "opacity-70" : ""}`}>
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Skeleton loader */}
        {!isImageLoaded && <div className="absolute inset-0 skeleton" />}
        
        <img
          src={imageSrc}
          alt={outfit.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setIsImageLoaded(true);
          }}
        />
        
        {/* Occasion Badge */}
        <Badge className="absolute top-4 left-4 gradient-bg text-primary-foreground border-0 shadow-button">
          {outfit.occasion}
        </Badge>

        {/* Out of Stock Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge className="bg-destructive text-destructive-foreground border-0 text-sm px-4 py-2 shadow-lg flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 ${
            isWishlisted 
              ? "bg-primary text-primary-foreground" 
              : "bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Hover Overlay */}
        {isAvailable && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            {/* Action Buttons on Hover */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <Button
                onClick={handleViewDetails}
                className="flex-1 gradient-bg shadow-button hover:opacity-90"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              {!isAdmin && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/outfit/${outfit.id}`);
                  }}
                  variant="secondary"
                  className="bg-background/90 backdrop-blur-sm hover:bg-background"
                >
                  <ShoppingBag className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 
          onClick={handleViewDetails}
          className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
        >
          {outfit.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1 text-lg font-bold gradient-text mb-4">
          <IndianRupee className="w-4 h-4" />
          <span>{outfit.price.toLocaleString("en-IN")}</span>
          <span className="text-sm font-normal text-muted-foreground ml-1">
            / {outfit.duration}
          </span>
        </div>

        {/* Size Options */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Available Sizes</p>
          <div className="flex gap-2">
            {outfit.sizes.map((size) => (
              <span
                key={size}
                className="px-3 py-1 text-sm font-medium rounded-lg bg-accent text-accent-foreground border border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {/* View Details Button */}
        <Button
          onClick={handleViewDetails}
          variant="outline"
          disabled={!isAvailable}
          className="w-full rounded-xl border-primary/30 hover:bg-accent hover:border-primary transition-all duration-300"
        >
          {isAvailable ? "View Details" : "Currently Unavailable"}
        </Button>
      </div>
    </div>
  );
};

export default OutfitCard;
