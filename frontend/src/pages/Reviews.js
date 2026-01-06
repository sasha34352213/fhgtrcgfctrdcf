import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Reviews = () => {
  const { language } = useLanguage();
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
    <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="reviews-page">
      {/* Header */}
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl text-white text-center"
          >
            {language === 'de' ? 'KUNDENBEWERTUNGEN' : 'CUSTOMER REVIEWS'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 mt-4 text-sm uppercase tracking-wider text-center"
          >
            {language === 'de' ? 'Was unsere Kunden sagen' : 'What our customers say'}
          </motion.p>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/50">{language === 'de' ? 'Noch keine Bewertungen' : 'No reviews yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="reviews-grid">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1a1a1a] border border-white/10 p-6"
                  data-testid={`review-${review.id}`}
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'fill-white text-white' : 'text-white/20'}
                      />
                    ))}
                  </div>

                  {/* Image */}
                  {review.image_url && (
                    <div className="aspect-video mb-4 overflow-hidden bg-[#262626]">
                      <img
                        src={review.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Text */}
                  <p className="text-white/70 leading-relaxed mb-4 italic">"{getText(review)}"</p>

                  {/* Author */}
                  <p className="text-white/50 text-sm">
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
