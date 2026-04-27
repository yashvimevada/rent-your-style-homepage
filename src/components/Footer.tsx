import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, Heart, CreditCard, Shield, Truck, RotateCcw } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Guarantees Bar */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹999" },
              { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free process" },
              { icon: Shield, title: "Quality Assured", desc: "Premium outfits only" },
              { icon: CreditCard, title: "Secure Payments", desc: "100% safe checkout" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <img src="/logo.png" alt="WardrobeX" className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India's premier outfit rental platform. Access designer fashion at a fraction of the price. Sustainable, stylish, and always on-trend.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Browse Outfits", href: "/outfits" },
                { name: "How It Works", href: "/#how-it-works" },
                { name: "My Dashboard", href: "/dashboard" },
                { name: "Cart", href: "/cart" },
                { name: "Login / Sign Up", href: "/login" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <Link
                    to={href}
                    className="text-sm text-gray-400 hover:text-rose-400 transition-colors hover:pl-1 duration-200 inline-block"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Policies */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Policies</h3>
            <ul className="space-y-3">
              {[
                "Privacy Policy",
                "Terms & Conditions",
                "Rental Agreement",
                "Return Policy",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-rose-400 transition-colors hover:pl-1 duration-200 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+917600317567" className="flex items-center gap-3 text-sm text-gray-400 hover:text-rose-400 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  +91 7600317567
                </a>
              </li>
              <li>
                <a href="tel:+919313081273" className="flex items-center gap-3 text-sm text-gray-400 hover:text-rose-400 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  +91 9313081273
                </a>
              </li>
              <li>
                <a href="mailto:yashvimevada23@gmail.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-rose-400 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  yashvimevada23@gmail.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  Gujarat, India
                </div>
              </li>
            </ul>
            <Link
              to="/contact"
              className="inline-flex items-center mt-5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-full transition-colors shadow-md shadow-rose-500/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">We Accept:</span>
              <div className="flex items-center gap-3 ml-2">
                {["Visa", "Mastercard", "UPI", "PayTM", "GPay"].map((method) => (
                  <span key={method} className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-md font-medium">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              © {currentYear} WardrobeX. Made with
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              in India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
