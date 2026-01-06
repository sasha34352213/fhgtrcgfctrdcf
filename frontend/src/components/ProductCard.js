import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, brand }) => {
  const { language } = useLanguage();

  const name = language === 'de' && product.name_de ? product.name_de : product.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="product-card group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden mb-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              className="product-image w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-white text-sm font-medium mb-1 group-hover:text-white/80 transition-colors">
            {name}
          </h3>
          {brand && (
            <p className="text-white/50 text-xs uppercase tracking-wider">
              {brand.name}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
