import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Play, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Lehenga", emoji: "👗", color: "from-pink-400 to-rose-500" },
  { name: "Saree", emoji: "🥻", color: "from-purple-400 to-indigo-500" },
  { name: "Gown", emoji: "👘", color: "from-amber-400 to-orange-500" },
  { name: "Suit", emoji: "🤵", color: "from-blue-400 to-cyan-500" },
  { name: "Sherwani", emoji: "🧥", color: "from-emerald-400 to-teal-500" },
  { name: "Western", emoji: "👔", color: "from-violet-400 to-purple-500" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-white pt-24 md:pt-28">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-rose-100/20 to-purple-100/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center pb-12">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 mb-8 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Trending: Wedding Season Collection 🔥</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-6 animate-fade-in text-gray-900" style={{ animationDelay: "0.1s" }}>
            Rent Designer Outfits
            <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mt-2">
              Look Stunning Always
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Access a curated collection of premium fashion. Rent stunning outfits for any occasion at <span className="text-rose-500 font-semibold">up to 90% off</span> retail price.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              onClick={() => navigate("/outfits")}
              className="bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 text-lg px-8 py-6 rounded-full group hover:scale-105 transition-all duration-300 font-semibold"
            >
              Browse Outfits
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-lg px-8 py-6 rounded-full border-gray-300 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 group hover:scale-105 text-gray-700"
            >
              <Play className="mr-2 w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-14 max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "500+", label: "Outfits" },
              { value: "50k+", label: "Happy Renters" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bubbles — Myntra-style */}
        <div className="pb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Shop by Category</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {categories.map(({ name, emoji, color }) => (
              <button
                key={name}
                onClick={() => navigate("/outfits")}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  {emoji}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-rose-500 transition-colors">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
