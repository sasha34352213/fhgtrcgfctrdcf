import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { ShoppingCart, FileText, MessageCircle, Send, Instagram, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const { language, t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, productsRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/products?featured=true`),
          axios.get(`${API}/reviews`)
        ]);
        setBrands(brandsRes.data);
        setFeaturedProducts(productsRes.data.slice(0, 4));
        setReviews(reviewsRes.data.slice(0, 1));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBrandForProduct = (product) => {
    return brands.find(b => b.id === product.brand_id);
  };

  const steps = [
    { 
      icon: ShoppingCart, 
      number: '1', 
      title: language === 'de' ? 'IN DEN WARENKORB' : 'ADD TO CART',
      desc: language === 'de' ? 'Wählen Sie Ihre Produkte' : 'Select your products'
    },
    { 
      icon: FileText, 
      number: '2', 
      title: language === 'de' ? 'PDF GENERIEREN' : 'GENERATE PDF',
      desc: language === 'de' ? 'Erstellen Sie Ihre Bestellung' : 'Create your order summary'
    },
    { 
      icon: MessageCircle, 
      number: '3', 
      title: language === 'de' ? 'PER MESSENGER SENDEN' : 'SEND VIA MESSENGER',
      desc: language === 'de' ? 'WhatsApp, Telegram oder Instagram' : 'WhatsApp, Telegram or Instagram'
    },
  ];

  return (
    <div className="min-h-screen bg-[#141414]" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center" data-testid="hero-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-4">
                FASHION &<br />LUXURY BRANDS
              </h1>
              <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-8">
                {language === 'de' ? 'DURCHSUCHEN. AUSWÄHLEN. BESTELLEN.' : 'BROWSE. SELECT. ORDER.'}
              </p>
              <Link
                to="/catalog"
                className="btn-primary inline-flex items-center gap-2"
                data-testid="hero-cta"
              >
                {language === 'de' ? 'JETZT EINKAUFEN' : 'SHOP NOW'}
              </Link>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/8108586/pexels-photo-8108586.jpeg"
                  alt="Fashion Model"
                  className="w-full h-[400px] lg:h-[600px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-8 border-y border-white/10" data-testid="brand-logos">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {brands.slice(0, 5).map((brand) => (
              <Link
                key={brand.id}
                to={`/catalog?brand=${brand.id}`}
                className="brand-logo"
                data-testid={`brand-logo-${brand.id}`}
              >
                <span className="font-heading text-xl md:text-2xl text-white/70 hover:text-white transition-colors">
                  {brand.name.toUpperCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Brands / Featured Products */}
      <section className="py-16 md:py-24" data-testid="featured-products">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl text-white">
              {language === 'de' ? 'TOP MARKEN' : 'TOP BRANDS'}
            </h2>
          </div>

          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brand={getBrandForProduct(product)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/catalog"
              className="btn-secondary inline-flex items-center gap-2"
            >
              {language === 'de' ? 'ALLE ANSEHEN' : 'VIEW ALL'}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* How to Order */}
      <section className="py-16 md:py-24 bg-[#1a1a1a]" data-testid="how-to-order">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <h2 className="font-heading text-2xl md:text-3xl text-white text-center mb-12">
            {language === 'de' ? 'SO BESTELLEN SIE' : 'HOW TO ORDER'}
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="step-card flex-1 max-w-[280px]"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="step-icon">
                    <step.icon size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-white/50 text-sm mb-1">{step.number}.</p>
                  <h3 className="font-heading text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm">{step.desc}</p>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center px-4">
                    <ChevronRight size={24} className="text-white/30" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Customer Reviews */}
      <section className="py-16 md:py-24" data-testid="reviews-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <h2 className="font-heading text-2xl md:text-3xl text-white text-center mb-12">
            {language === 'de' ? 'KUNDENBEWERTUNGEN' : 'CUSTOMER REVIEWS'}
          </h2>

          {reviews.length > 0 && (
            <div className="max-w-2xl mx-auto">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="review-card flex flex-col md:flex-row gap-6 items-center"
                >
                  <div className="w-24 h-24 rounded-full bg-[#262626] flex-shrink-0 overflow-hidden">
                    {review.image_url ? (
                      <img src={review.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-2xl font-heading">
                        {review.author?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-white text-white' : 'text-white/20'} />
                      ))}
                    </div>
                    <p className="text-white/80 italic mb-3">
                      "{language === 'de' && review.text_de ? review.text_de : review.text}"
                    </p>
                    <p className="text-white/50 text-sm">— {review.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/reviews"
              className="btn-secondary inline-flex items-center gap-2"
            >
              {language === 'de' ? 'MEHR BEWERTUNGEN' : 'View More Reviews'}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#1a1a1a]" data-testid="contact-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl text-white mb-8">
            {language === 'de' ? 'KONTAKTIEREN SIE UNS' : 'CONTACT US'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/41765288403"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a
              href="https://t.me/Hoohlya"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <Send size={18} />
              Telegram
            </a>
            <a
              href="https://www.instagram.com/hoohlyashop"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <Instagram size={18} />
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
