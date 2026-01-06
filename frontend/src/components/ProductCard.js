import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, brand, isLarge = false }) => {
  const { language, t } = useLanguage();

  const name = language === 'de' && product.name_de ? product.name_de : product.name;
  const priceText = language === 'de' ? product.price_text_de : product.price_text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`product-card group relative overflow-hidden bg-[#0a0a0a] ${isLarge ? 'aspect-square md:aspect-[4/3]' : 'aspect-[3/4]'}`}
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block w-full h-full">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              className="product-image w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white/20 font-mono text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          {brand && (
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#CCFF00] mb-1 block">
              {brand.name}
            </span>
          )}
          <h3 className={`font-heading ${isLarge ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'} text-white leading-tight mb-2`}>
            {name}
          </h3>
          <span className="text-xs md:text-sm text-white/50 font-mono">
            {priceText || t('catalog.priceOnRequest')}
          </span>
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-[#CCFF00] text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1">
              Featured
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default ProductCard;
