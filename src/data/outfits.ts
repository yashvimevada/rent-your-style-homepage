import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";
import outfit5 from "@/assets/outfit-5.jpg";
import outfit6 from "@/assets/outfit-6.jpg";

export interface Outfit {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
  sizes: string[];
  occasion: string;
  description: string;
  category: string;
  available?: boolean;
}

export const outfits: Outfit[] = [
  {
    id: "1",
    name: "Royal Burgundy Bridal Lehenga",
    price: 2999,
    duration: "3 days",
    image: outfit1,
    sizes: ["S", "M", "L", "XL"],
    occasion: "Wedding",
    description: "Exquisite burgundy bridal lehenga with intricate gold zari embroidery. Perfect for brides who want to make a statement on their special day. Includes matching dupatta and blouse.",
    category: "Women",
  },
  {
    id: "2",
    name: "Blush Pink Designer Saree",
    price: 1499,
    duration: "3 days",
    image: outfit2,
    sizes: ["S", "M", "L"],
    occasion: "Party",
    description: "Elegant pastel pink saree with delicate embroidery work. Ideal for sangeet, cocktail parties, or any festive celebration. Lightweight and comfortable.",
    category: "Women",
  },
  {
    id: "3",
    name: "Royal Blue Sherwani Set",
    price: 2499,
    duration: "3 days",
    image: outfit3,
    sizes: ["M", "L", "XL"],
    occasion: "Wedding",
    description: "Magnificent navy blue sherwani with gold embroidery and matching accessories. Complete set includes turban, stole, and churidar. Perfect for grooms.",
    category: "Men",
  },
  {
    id: "4",
    name: "Emerald Green Anarkali Gown",
    price: 1299,
    duration: "3 days",
    image: outfit4,
    sizes: ["S", "M", "L", "XL"],
    occasion: "Party",
    description: "Stunning emerald green anarkali with sequin work and flowing silhouette. Perfect for engagement parties, reception, or festive occasions.",
    category: "Women",
  },
  {
    id: "5",
    name: "Golden Champagne Evening Gown",
    price: 1799,
    duration: "3 days",
    image: outfit5,
    sizes: ["S", "M", "L"],
    occasion: "Formal",
    description: "Glamorous golden champagne mermaid gown with beaded detailing. Perfect for cocktail parties, receptions, and formal evening events.",
    category: "Women",
  },
  {
    id: "6",
    name: "Purple Velvet Blazer Suit",
    price: 1999,
    duration: "3 days",
    image: outfit6,
    sizes: ["M", "L", "XL"],
    occasion: "Festive",
    description: "Sophisticated purple velvet blazer suit for men. Ideal for cocktail parties, sangeet nights, and formal celebrations. Includes blazer and trousers.",
    category: "Men",
  },
];

export const occasions = ["All", "Wedding", "Party", "Formal", "Festive", "Casual"];
export const sizes = ["All", "S", "M", "L", "XL", "XXL"];
