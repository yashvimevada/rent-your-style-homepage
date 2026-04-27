import { Search, Filter, IndianRupee } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { occasions, sizes } from "@/data/outfits";

interface OutfitFiltersProps {
  selectedOccasion: string;
  selectedSize: string;
  searchQuery: string;
  priceRange: [number, number];
  maxPrice: number;
  onOccasionChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onPriceRangeChange: (value: [number, number]) => void;
}

const OutfitFilters = ({
  selectedOccasion,
  selectedSize,
  searchQuery,
  priceRange,
  maxPrice,
  onOccasionChange,
  onSizeChange,
  onSearchChange,
  onPriceRangeChange,
}: OutfitFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search outfits by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl bg-background border-border focus:border-primary shadow-sm"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 rounded-2xl card-gradient border border-border shadow-card">
        <div className="flex items-center gap-2 text-foreground">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-medium">Filters:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          {/* Occasion Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Category
            </label>
            <Select value={selectedOccasion} onValueChange={onOccasionChange}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((occasion) => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Size
            </label>
            <Select value={selectedSize} onValueChange={onSizeChange}>
              <SelectTrigger className="w-full sm:w-[120px] bg-background">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              Price Range
              <span className="text-primary font-semibold ml-1">
                ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
              </span>
            </label>
            <Slider
              min={0}
              max={maxPrice}
              step={100}
              value={priceRange}
              onValueChange={(val) => onPriceRangeChange(val as [number, number])}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitFilters;
