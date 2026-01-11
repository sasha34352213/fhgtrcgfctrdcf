import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ images = [], alt = "Product" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  
  // For swipe detection
  const dragX = useMotionValue(0);
  const dragProgress = useTransform(dragX, [-200, 0, 200], [-1, 0, 1]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-[#1a1a1a] flex items-center justify-center rounded">
        <span className="text-white/20">No Image</span>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = images.length - 1;
      if (next >= images.length) next = 0;
      return next;
    });
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Main Image Container */}
      <div className="aspect-square bg-[#f5f5f5] rounded overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
          />
        </AnimatePresence>

        {/* Desktop Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 md:opacity-70 hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Previous image"
              data-testid="carousel-prev"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 md:opacity-70 hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Next image"
              data-testid="carousel-next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Swipe Hint for Mobile */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden">
          <span className="text-xs text-black/50 bg-white/80 px-2 py-1 rounded-full">
            ← Swipe →
          </span>
        </div>
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3" data-testid="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-[#c9a962] w-6' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (optional for desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex 
                  ? 'border-[#c9a962]' 
                  : 'border-transparent hover:border-white/30'
              }`}
              data-testid={`thumbnail-${index}`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
