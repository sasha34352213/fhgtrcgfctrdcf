import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShoppingBag, MessageCircle, Send, Instagram } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import ImageCarousel from '../components/ImageCarousel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRes = await axios.get(`${API}/products/${id}`);
        setProduct(productRes.data);

        if (productRes.data.brand_id) {
          const brandRes = await axios.get(`${API}/brands/${productRes.data.brand_id}`);
          setBrand(brandRes.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error(language === 'de' ? 'Bitte Größe wählen' : 'Please select a size');
      return;
    }
    addToCart(product, brand, selectedSize);
    setAddedToCart(true);
    toast.success(`${name} ${language === 'de' ? 'zum Warenkorb hinzugefügt' : 'added to cart'}`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#141414]">
        <div className="w-12 h-12 border-2 border-[#c9a962] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4 bg-[#141414]">
        <p className="text-white/50">Product not found</p>
        <Link to="/catalog" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const name = language === 'de' && product.name_de ? product.name_de : product.name;
  const description = language === 'de' && product.description_de ? product.description_de : product.description;
  const priceText = language === 'de' ? product.price_text_de : product.price_text;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="product-detail-page">
      {/* Back Button */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-4">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-white/50 hover:text-white transition-colors duration-300"
          data-testid="back-to-catalog"
        >
          <ArrowLeft size={16} />
          {language === 'de' ? 'Zurück' : 'Back'}
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group"
            data-testid="product-images"
          >
            <ImageCarousel 
              images={product.images || []} 
              alt={name}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand */}
            {brand && (
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                {brand.name}
              </span>
            )}

            {/* Name */}
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white" data-testid="product-name">
              {name}
            </h1>

            {/* Price */}
            <p className="text-[#c9a962] font-semibold text-xl" data-testid="product-price">
              {priceText || 'CHF on request'}
            </p>

            {/* Description */}
            {description && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 leading-relaxed" data-testid="product-description">
                  {description}
                </p>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                  {language === 'de' ? 'Größe wählen' : 'Select Size'}
                </h3>
                <div className="flex flex-wrap gap-2" data-testid="size-selector">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-10 px-4 text-sm border transition-all duration-300 rounded ${
                        selectedSize === size
                          ? 'bg-[#c9a962] text-black border-[#c9a962]'
                          : 'bg-transparent text-white border-white/20 hover:border-white/50'
                      }`}
                      data-testid={`size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="pt-6">
              <Button
                onClick={handleAddToCart}
                className={`w-full h-12 font-semibold text-sm uppercase tracking-wider transition-all duration-300 rounded ${
                  addedToCart
                    ? 'bg-green-500 hover:bg-green-500 text-white'
                    : 'bg-[#c9a962] hover:bg-[#d4b872] text-black'
                }`}
                data-testid="add-to-cart-btn"
              >
                {addedToCart ? (
                  <span className="flex items-center gap-2">
                    <Check size={18} />
                    {language === 'de' ? 'Hinzugefügt!' : 'Added!'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={18} />
                    {language === 'de' ? 'IN DEN WARENKORB' : 'ADD TO CART'}
                  </span>
                )}
              </Button>
            </div>

            {/* Contact */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                {language === 'de' ? 'Fragen? Kontaktieren Sie uns' : 'Questions? Contact us'}
              </h3>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/41765288403" target="_blank" rel="noopener noreferrer" className="contact-btn">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href="https://t.me/Hoohlya" target="_blank" rel="noopener noreferrer" className="contact-btn">
                  <Send size={16} /> Telegram
                </a>
                <a href="https://www.instagram.com/hoohlyashop" target="_blank" rel="noopener noreferrer" className="contact-btn">
                  <Instagram size={16} /> Instagram
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
