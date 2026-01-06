import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, FileText, Download } from 'lucide-react';
import axios from 'axios';
import ContactButtons from '../components/ContactButtons';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Cart = () => {
  const { language, t } = useLanguage();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  const handleGenerateOrder = async () => {
    if (!customerName.trim()) {
      toast.error(language === 'de' ? 'Bitte geben Sie Ihren Namen ein' : 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart,
        customer_name: customerName,
        customer_contact: customerContact,
        comment: comment,
        language: language
      };

      const response = await axios.post(`${API}/orders`, orderData);
      setOrderCreated(response.data);
      clearCart();
      toast.success(t('order.success'));
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (orderCreated) {
      window.open(`${API}/orders/${orderCreated.order_id}/pdf`, '_blank');
    }
  };

  const handleNewOrder = () => {
    setOrderCreated(null);
    setCustomerName('');
    setCustomerContact('');
    setComment('');
  };

  // Order Success View
  if (orderCreated) {
    return (
      <div className="min-h-screen pt-20 md:pt-24" data-testid="order-success">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center bg-[#CCFF00]">
              <FileText size={40} className="text-black" />
            </div>

            <h1 className="font-heading text-4xl md:text-5xl mb-4" data-testid="order-success-title">
              {t('order.success')}
            </h1>

            <p className="font-mono text-lg text-[#CCFF00] mb-8" data-testid="order-number">
              {t('order.orderNumber')}: {orderCreated.order_number}
            </p>

            <Button
              onClick={handleDownloadPdf}
              className="btn-primary mb-8 inline-flex items-center gap-2"
              data-testid="download-pdf-btn"
            >
              <Download size={18} />
              {t('order.downloadPdf')}
            </Button>

            <div className="bg-[#0a0a0a] border border-white/10 p-8 mb-8">
              <p className="text-white/70 mb-6">{t('order.instruction')}</p>
              <ContactButtons />
            </div>

            <button
              onClick={handleNewOrder}
              className="text-sm font-mono uppercase tracking-widest text-white/50 hover:text-[#CCFF00] transition-colors duration-300"
              data-testid="new-order-btn"
            >
              {t('order.newOrder')}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 md:pt-24" data-testid="empty-cart">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center border border-white/20">
            <ShoppingBag size={40} className="text-white/30" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl mb-4">{t('cart.title')}</h1>
          <p className="text-white/50 mb-8">{t('cart.empty')}</p>
          <Link to="/catalog" className="btn-primary inline-block" data-testid="continue-shopping-btn">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  // Cart View
  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="cart-page">
      {/* Header */}
      <div className="py-12 md:py-16 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl"
          >
            {t('cart.title')}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.product_id}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-[#0a0a0a] border border-white/5 p-4"
                data-testid={`cart-item-${item.product_id}`}
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-[#1a1a1a]">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00] mb-1">
                    {item.brand_name}
                  </p>
                  <h3 className="font-heading text-lg truncate mb-1">{item.product_name}</h3>
                  {item.size && (
                    <p className="text-xs text-white/50 font-mono">Size: {item.size}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product_id, item.size)}
                    className="text-white/30 hover:text-red-500 transition-colors duration-300"
                    data-testid={`remove-${item.product_id}`}
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors duration-300"
                      data-testid={`decrease-${item.product_id}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors duration-300"
                      data-testid={`increase-${item.product_id}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:sticky lg:top-28 lg:self-start" data-testid="checkout-form">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8">
              <h2 className="font-heading text-2xl mb-6">{t('cart.checkout')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">
                    {t('cart.name')} *
                  </label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00] h-12"
                    data-testid="customer-name-input"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">
                    {t('cart.contact')}
                  </label>
                  <Input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00] h-12"
                    data-testid="customer-contact-input"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">
                    {t('cart.comment')}
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00] resize-none"
                    data-testid="comment-input"
                  />
                </div>

                <Button
                  onClick={handleGenerateOrder}
                  disabled={loading}
                  className="w-full h-14 btn-primary mt-4"
                  data-testid="generate-order-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText size={18} />
                      {t('cart.generateOrder')}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
