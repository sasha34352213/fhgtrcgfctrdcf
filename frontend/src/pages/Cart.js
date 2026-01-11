import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, FileText, Download, MessageCircle, Send, Instagram } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Cart = () => {
  const { language } = useLanguage();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  // Calculate totals
  const getItemPrice = (item) => {
    // Extract numeric price from price_text if available, otherwise return 0
    const priceMatch = item.price_text?.match(/[\d.]+/);
    return priceMatch ? parseFloat(priceMatch[0]) : 0;
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  };

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
      toast.success(language === 'de' ? 'Bestellung erstellt!' : 'Order Created!');
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
      <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="order-success">
        <div className="max-w-xl mx-auto px-6 md:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#c9a962] rounded-full">
              <FileText size={32} className="text-black" />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl text-white mb-4" data-testid="order-success-title">
              {language === 'de' ? 'BESTELLUNG ERSTELLT!' : 'ORDER CREATED!'}
            </h1>

            <p className="text-white/60 mb-2" data-testid="order-number">
              {language === 'de' ? 'Bestellnummer' : 'Order Number'}: <span className="text-[#c9a962]">{orderCreated.order_number}</span>
            </p>

            <Button
              onClick={handleDownloadPdf}
              className="bg-[#c9a962] hover:bg-[#d4b872] text-black font-semibold mt-6 inline-flex items-center gap-2"
              data-testid="download-pdf-btn"
            >
              <Download size={18} />
              {language === 'de' ? 'PDF HERUNTERLADEN' : 'DOWNLOAD PDF'}
            </Button>

            <div className="bg-[#1a1a1a] border border-white/10 p-6 mt-8 rounded">
              <p className="text-white/60 mb-4 text-sm">
                {language === 'de' 
                  ? 'Bitte senden Sie dieses PDF, um Ihre Bestellung abzuschließen:' 
                  : 'Please send this PDF to complete your order:'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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

            <button
              onClick={handleNewOrder}
              className="mt-8 text-sm uppercase tracking-wider text-white/50 hover:text-white transition-colors duration-300"
              data-testid="new-order-btn"
            >
              {language === 'de' ? 'Neue Bestellung starten' : 'Start New Order'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="empty-cart">
        <div className="max-w-xl mx-auto px-6 md:px-12 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-white/20 rounded-full">
            <ShoppingBag size={32} className="text-white/30" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-white mb-4">
            {language === 'de' ? 'IHR WARENKORB' : 'YOUR CART'}
          </h1>
          <p className="text-white/50 mb-8">{language === 'de' ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}</p>
          <Link to="/catalog" className="btn-primary inline-block" data-testid="continue-shopping-btn">
            {language === 'de' ? 'WEITER EINKAUFEN' : 'CONTINUE SHOPPING'}
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  // Cart View
  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="cart-page">
      {/* Header */}
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl text-white text-center"
          >
            {language === 'de' ? 'IHR WARENKORB' : 'YOUR CART'}
          </motion.h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.product_id}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-[#1a1a1a] border border-white/10 p-4 rounded"
                data-testid={`cart-item-${item.product_id}`}
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-[#f5f5f5] rounded overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                    {item.brand_name}
                  </p>
                  <h3 className="text-white text-sm font-medium truncate mb-1">{item.product_name}</h3>
                  {item.size && (
                    <p className="text-xs text-white/50">{language === 'de' ? 'Größe' : 'Size'}: {item.size}</p>
                  )}
                  {/* Item Price */}
                  <p className="text-[#c9a962] font-semibold mt-2">
                    {item.price_text || 'CHF on request'}
                  </p>
                </div>

                {/* Quantity & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product_id, item.size)}
                    className="text-white/30 hover:text-red-500 transition-colors duration-300"
                    data-testid={`remove-${item.product_id}`}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors duration-300 rounded"
                      data-testid={`decrease-${item.product_id}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors duration-300 rounded"
                      data-testid={`increase-${item.product_id}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Order Summary */}
            <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded mt-6">
              <div className="flex justify-between items-center text-white/70 mb-2">
                <span>{language === 'de' ? 'Artikel' : 'Items'}</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-white font-semibold text-lg pt-2 border-t border-white/10">
                <span>{language === 'de' ? 'GESAMT' : 'TOTAL'}</span>
                <span className="text-[#c9a962]">
                  {total > 0 ? `CHF ${total.toFixed(2)}` : (language === 'de' ? 'Auf Anfrage' : 'On request')}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div data-testid="checkout-form">
            <div className="bg-[#1a1a1a] border border-white/10 p-6 sticky top-28 rounded">
              <h2 className="font-heading text-xl text-white mb-6">
                {language === 'de' ? 'BESTELLUNG ABSCHLIESSEN' : 'CHECKOUT'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">
                    {language === 'de' ? 'Ihr Name' : 'Your Name'} *
                  </label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-[#262626] border-white/10 focus:border-[#c9a962] h-10 text-white placeholder:text-white/30 rounded"
                    data-testid="customer-name-input"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">
                    {language === 'de' ? 'Kontakt (optional)' : 'Contact (optional)'}
                  </label>
                  <Input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="bg-[#262626] border-white/10 focus:border-[#c9a962] h-10 text-white placeholder:text-white/30 rounded"
                    data-testid="customer-contact-input"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">
                    {language === 'de' ? 'Kommentar (optional)' : 'Comment (optional)'}
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="bg-[#262626] border-white/10 focus:border-[#c9a962] resize-none text-white placeholder:text-white/30 rounded"
                    data-testid="comment-input"
                  />
                </div>

                <Button
                  onClick={handleGenerateOrder}
                  disabled={loading}
                  className="w-full h-12 bg-[#c9a962] hover:bg-[#d4b872] text-black font-semibold text-sm uppercase tracking-wider rounded mt-4"
                  data-testid="generate-order-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText size={18} />
                      {language === 'de' ? 'PDF GENERIEREN' : 'GENERATE PDF'}
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
