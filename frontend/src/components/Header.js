import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { cartCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/catalog', label: language === 'de' ? 'KATALOG' : 'CATALOG' },
    { path: '/reviews', label: language === 'de' ? 'BEWERTUNGEN' : 'REVIEWS' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass" data-testid="header">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo">
            <span className="font-heading text-xl md:text-2xl tracking-wider text-white">
              HOOHLYASHOP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive(item.path) ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
                data-testid={`nav-${item.path.replace('/', '')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors duration-300"
              data-testid="language-switcher"
            >
              {language === 'en' ? 'EN' : 'DE'} | {language === 'en' ? 'DE' : 'EN'}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
              data-testid="cart-link"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2"
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#141414] border-t border-white/10"
            data-testid="mobile-nav"
          >
            <nav className="flex flex-col py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-6 py-3 text-sm uppercase tracking-wider ${
                    isActive(item.path) ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-sm uppercase tracking-wider text-white/60 flex items-center gap-2"
              >
                {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
