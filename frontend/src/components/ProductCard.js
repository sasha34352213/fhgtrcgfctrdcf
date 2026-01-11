import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, brand }) => {
  const { language } = useLanguage();

  const name = language === 'de' && product.name_de ? product.name_de : product.name;
  const priceText = language === 'de' && product.price_text_de ? product.price_text_de : product.price_text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="product-card group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image - Original colors, no filters */}
        <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden mb-3 rounded">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <span className="text-white/20 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center space-y-1">
          {brand && (
            <p className="text-white/50 text-xs uppercase tracking-wider">
              {brand.name}
            </p>
          )}
          <h3 className="text-white text-sm font-medium group-hover:text-white/80 transition-colors line-clamp-2">
            {name}
          </h3>
          {/* Price in CHF */}
          <p className="text-white font-semibold text-base">
            {priceText || 'CHF on request'}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
