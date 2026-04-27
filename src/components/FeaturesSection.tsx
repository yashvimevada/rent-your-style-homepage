import { DollarSign, Calendar, Truck } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Affordable Fashion",
    description: "Access designer pieces at a fraction of the retail price. Look amazing without breaking the bank.",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Simple online booking system. Choose your outfit, pick your dates, and you're all set.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description: "We deliver right to your door and pick it up when you're done. Hassle-free from start to finish.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Why Choose <span className="gradient-text">Rent Your Style</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            We make fashion accessible, sustainable, and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl card-gradient border border-border shadow-card hover:shadow-soft transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 shadow-button group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
