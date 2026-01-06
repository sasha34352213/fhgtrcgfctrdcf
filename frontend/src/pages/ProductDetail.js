import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShoppingBag, MessageCircle, Send, Instagram } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
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
        <div className="w-12 h-12 border-2 border-white border-t-transparent animate-spin rounded-full" />
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
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-white/50 hover:text-white transition-colors duration-300"
          data-testid="back-to-catalog"
        >
          <ArrowLeft size={16} />
          {language === 'de' ? 'Zurück' : 'Back'}
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-[#1a1a1a] overflow-hidden" data-testid="main-image">
              {product.images?.[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/20">No Image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors duration-300 ${
                      activeImage === index ? 'border-white' : 'border-transparent'
                    }`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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
            <h1 className="font-heading text-4xl md:text-5xl text-white" data-testid="product-name">
              {name}
            </h1>

            {/* Price */}
            <p className="text-white/60" data-testid="product-price">
              {priceText || (language === 'de' ? 'Preis auf Anfrage' : 'Price on request')}
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
                      className={`min-w-[48px] h-10 px-4 text-sm border transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-white text-black border-white'
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
                className={`w-full h-12 font-medium text-sm uppercase tracking-wider transition-all duration-300 rounded-none ${
                  addedToCart
                    ? 'bg-green-500 hover:bg-green-500 text-white'
                    : 'bg-white hover:bg-white/90 text-black'
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
