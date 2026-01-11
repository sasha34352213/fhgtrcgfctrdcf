// Sample data to seed the database
// Run: mongoimport --db hoohlyashop --collection brands --file seed_data/brands.json --jsonArray

const brands = [
  { id: "brand-nike", name: "Nike", name_de: "Nike", logo_url: null },
  { id: "brand-adidas", name: "Adidas", name_de: "Adidas", logo_url: null },
  { id: "brand-lv", name: "Louis Vuitton", name_de: "Louis Vuitton", logo_url: null },
  { id: "brand-gucci", name: "Gucci", name_de: "Gucci", logo_url: null },
  { id: "brand-stone", name: "Stone Island", name_de: "Stone Island", logo_url: null }
];

const categories = [
  { id: "cat-clothing", name: "Clothing", name_de: "Kleidung", slug: "clothing" },
  { id: "cat-footwear", name: "Footwear", name_de: "Schuhe", slug: "footwear" },
  { id: "cat-accessories", name: "Accessories", name_de: "Accessoires", slug: "accessories" }
];

const products = [
  {
    id: "prod-1",
    name: "Air Jordan 1 Retro High",
    name_de: "Air Jordan 1 Retro High",
    description: "Iconic basketball silhouette with premium leather construction.",
    description_de: "Ikonische Basketball-Silhouette mit hochwertigem Leder.",
    brand_id: "brand-nike",
    category_id: "cat-footwear",
    images: ["https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    price_text: "CHF 289.00",
    price_text_de: "CHF 289.00",
    featured: true,
    active: true
  },
  {
    id: "prod-2",
    name: "Ultraboost 22",
    name_de: "Ultraboost 22",
    description: "Revolutionary running shoes with responsive cushioning.",
    description_de: "Revolutionäre Laufschuhe mit reaktionsschneller Dämpfung.",
    brand_id: "brand-adidas",
    category_id: "cat-footwear",
    images: ["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"],
    sizes: ["40", "41", "42", "43", "44"],
    price_text: "CHF 199.00",
    price_text_de: "CHF 199.00",
    featured: true,
    active: true
  }
];

const reviews = [
  {
    id: "rev-1",
    text: "Amazing quality! The sneakers arrived perfectly packaged. Highly recommend HooHlyaShop!",
    text_de: "Erstaunliche Qualität! Die Sneaker kamen perfekt verpackt an. Sehr empfehlenswert!",
    author: "Marco S.",
    rating: 5,
    active: true
  },
  {
    id: "rev-2",
    text: "Fast communication via WhatsApp and quick delivery. Will order again!",
    text_de: "Schnelle Kommunikation über WhatsApp und schnelle Lieferung. Werde wieder bestellen!",
    author: "Lisa M.",
    rating: 5,
    active: true
  }
];

module.exports = { brands, categories, products, reviews };
