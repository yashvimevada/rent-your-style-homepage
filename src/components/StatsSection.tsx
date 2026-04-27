import { TrendingUp, Users, Award, Recycle } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Happy Customers",
    description: "Trusted by fashion lovers",
  },
  {
    icon: TrendingUp,
    value: "500+",
    label: "Designer Outfits",
    description: "Curated collection",
  },
  {
    icon: Award,
    value: "4.9★",
    label: "Customer Rating",
    description: "Based on 10k+ reviews",
  },
  {
    icon: Recycle,
    value: "100K+",
    label: "Rentals Completed",
    description: "Sustainable fashion",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg shadow-button mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="font-medium text-foreground mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
