export type DressCategory = "Everyday" | "Vacation" | "Occasion";

export type DressProduct = {
  id: string;
  name: string;
  subtitle: string;
  priceCents: number;
  category: DressCategory;
  image: string;
  imageAlt: string;
  badge?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors: { name: string; hex: string }[];
  sizes: string[];
};

const productPhoto = (photoId: string) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1000`;

export const dresses: DressProduct[] = [
  {
    id: "marigold-wrap",
    name: "The Marigold Wrap",
    subtitle: "A little sunshine, wherever you go.",
    priceCents: 14800,
    category: "Vacation",
    image: productPhoto("4589202"),
    imageAlt: "A woman in a romantic floral dress on a sunny summer day",
    badge: "NEW ARRIVAL",
    isNew: true,
    colors: [
      { name: "Petal print", hex: "#d99b84" },
      { name: "Bluebell", hex: "#75839b" },
      { name: "Ivory", hex: "#eae3d5" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "louise-midi",
    name: "The Louise Midi",
    subtitle: "Made for long lunches and longer walks.",
    priceCents: 13800,
    category: "Everyday",
    image: productPhoto("33992628"),
    imageAlt: "A woman wearing a patterned summer dress in warm daylight",
    badge: "BESTSELLER",
    isBestSeller: true,
    colors: [
      { name: "Terracotta bloom", hex: "#bd6852" },
      { name: "Olive garden", hex: "#797d60" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "scarlet-silk",
    name: "The Scarlet Silk",
    subtitle: "A little drama, in all the right ways.",
    priceCents: 18800,
    category: "Occasion",
    image: productPhoto("29843456"),
    imageAlt: "An elegant woman in a flowing red dress",
    badge: "THE ONE",
    isNew: true,
    colors: [
      { name: "Pomegranate", hex: "#9d303a" },
      { name: "Midnight", hex: "#35343a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "garden-party",
    name: "The Garden Party",
    subtitle: "For every invitation that says yes.",
    priceCents: 15800,
    category: "Vacation",
    image: productPhoto("8890956"),
    imageAlt: "A woman in a floral dress surrounded by a dreamy garden",
    badge: "NEW ARRIVAL",
    isNew: true,
    colors: [
      { name: "Meadow", hex: "#73876c" },
      { name: "Rosewater", hex: "#d0a0a0" },
      { name: "Oat milk", hex: "#d7c8ac" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "dahlia-maxi",
    name: "The Dahlia Maxi",
    subtitle: "An old-soul print with a modern feel.",
    priceCents: 16800,
    category: "Occasion",
    image: productPhoto("36888268"),
    imageAlt: "An elegant floral dress styled for a special evening",
    isBestSeller: true,
    colors: [
      { name: "Midnight floral", hex: "#3f3543" },
      { name: "Burnished rose", hex: "#aa676c" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "sunday-bloom",
    name: "The Sunday Bloom",
    subtitle: "Your favourite day, in dress form.",
    priceCents: 12800,
    category: "Everyday",
    image: productPhoto("11556936"),
    imageAlt: "A floral sundress worn in bright summer light",
    colors: [
      { name: "Blue sky floral", hex: "#7d8fa0" },
      { name: "Soft peach", hex: "#d6a18e" },
      { name: "Ivory", hex: "#eae3d5" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "paris-in-spring",
    name: "Paris in Spring",
    subtitle: "A love letter to getting a little dressed up.",
    priceCents: 17800,
    category: "Occasion",
    image: productPhoto("29843430"),
    imageAlt: "A striking red dress on a classic European street",
    badge: "FEEL-GOOD FAVOURITE",
    colors: [
      { name: "French rose", hex: "#ae414b" },
      { name: "Black cherry", hex: "#512f39" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "celeste-evening",
    name: "The Celeste Evening",
    subtitle: "A little extra, because why not?",
    priceCents: 19800,
    category: "Occasion",
    image: productPhoto("33787054"),
    imageAlt: "A woman in an elegant evening dress outdoors",
    badge: "LIMITED EDITION",
    isNew: true,
    colors: [
      { name: "Rose noir", hex: "#72545a" },
      { name: "Champagne", hex: "#c7b093" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export const shippingThresholdCents = 15000;
export const standardShippingCents = 800;
