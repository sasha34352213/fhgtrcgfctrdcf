import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductCard = ({ product, brand }) => {
  const { language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const name = language === 'de' && product.name_de ? product.name_de : product.name;
  const priceText = language === 'de' && product.price_text_de ? product.price_text_de : product.price_text;

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      e.preventDefault();
      setCurrentImageIndex(prev => prev + 1);
    } else if (isRightSwipe && currentImageIndex > 0) {
      e.preventDefault();
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else {
      setCurrentImageIndex(images.length - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="product-card group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container with Swipe Support */}
        <div 
          className="relative aspect-square bg-[#f5f5f5] overflow-hidden mb-3 rounded"
          onTouchStart={hasMultipleImages ? onTouchStart : undefined}
          onTouchMove={hasMultipleImages ? onTouchMove : undefined}
          onTouchEnd={hasMultipleImages ? onTouchEnd : undefined}
        >
          {images.length > 0 ? (
            <>
              {/* Current Image */}
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Navigation Arrows (Desktop) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Image Dots Indicator */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-3' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
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
          <p className="text-[#c9a962] font-semibold text-base">
            {priceText || 'CHF on request'}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
