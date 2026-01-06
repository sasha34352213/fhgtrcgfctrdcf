import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Reviews = () => {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getText = (review) => {
    return language === 'de' && review.text_de ? review.text_de : review.text;
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="reviews-page">
      {/* Header */}
      <div className="py-12 md:py-16 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl"
          >
            {t('reviews.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 mt-4 font-mono text-sm uppercase tracking-widest"
          >
            {t('reviews.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="py-12 md:py-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] p-8 animate-pulse h-64" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/50 font-mono">No reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="reviews-grid">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 hover:border-[#CCFF00]/30 transition-colors duration-500"
                  data-testid={`review-${review.id}`}
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-[#CCFF00] text-[#CCFF00]' : 'text-white/20'}
                      />
                    ))}
                  </div>

                  {/* Image */}
                  {review.image_url && (
                    <div className="aspect-video mb-4 overflow-hidden bg-[#1a1a1a]">
                      <img
                        src={review.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Text */}
                  <p className="text-white/70 leading-relaxed mb-4">{getText(review)}</p>

                  {/* Author */}
                  <p className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
                    — {review.author}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
