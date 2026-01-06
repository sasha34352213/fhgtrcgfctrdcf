import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, Package, FileText, MessageCircle } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, productsRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/products?featured=true`)
        ]);
        setBrands(brandsRes.data);
        setFeaturedProducts(productsRes.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const steps = [
    { icon: Package, title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
    { icon: FileText, title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
    { icon: MessageCircle, title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
  ];

  const getBrandForProduct = (product) => {
    return brands.find(b => b.id === product.brand_id);
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/8108586/pexels-photo-8108586.jpeg"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#CCFF00] mb-4 block">
              {t('hero.subtitle')}
            </span>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-8">
              {t('hero.description')}
            </p>
            <Link
              to="/catalog"
              className="btn-primary inline-flex items-center gap-3"
              data-testid="hero-cta"
            >
              {t('hero.cta')}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 border-t border-white/10" data-testid="how-it-works">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-6xl text-center mb-16"
          >
            {t('howItWorks.title')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 hover:border-[#CCFF00]/30 transition-colors duration-500"
                data-testid={`step-${index + 1}`}
              >
                <div className="w-12 h-12 mb-6 flex items-center justify-center border border-[#CCFF00]/50">
                  <step.icon size={24} strokeWidth={1.5} className="text-[#CCFF00]" />
                </div>
                <span className="font-mono text-xs text-white/30 uppercase tracking-widest mb-2 block">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-xl md:text-2xl mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-24 md:py-32 border-t border-white/10" data-testid="brands-section">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl md:text-6xl"
            >
              {t('brands.title')}
            </motion.h2>
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-white/50 hover:text-[#CCFF00] transition-colors duration-300"
            >
              {t('brands.viewAll')}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/catalog?brand=${brand.id}`}
                  className="block bg-[#0a0a0a] border border-white/5 p-6 md:p-8 text-center hover:border-[#CCFF00]/50 transition-all duration-300 group"
                  data-testid={`brand-${brand.id}`}
                >
                  <span className="font-heading text-lg md:text-xl text-white/70 group-hover:text-white transition-colors duration-300">
                    {brand.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-24 md:py-32 border-t border-white/10" data-testid="featured-products">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-4xl md:text-6xl"
              >
                FEATURED
              </motion.h2>
              <Link
                to="/catalog"
                className="hidden md:flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-white/50 hover:text-[#CCFF00] transition-colors duration-300"
              >
                {t('brands.viewAll')}
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="tetris-grid">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brand={getBrandForProduct(product)}
                  isLarge={index === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
