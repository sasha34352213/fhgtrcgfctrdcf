import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, Send, Instagram } from 'lucide-react';

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="py-12 bg-[#0f0f0f] border-t border-white/10" data-testid="footer">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-8">
          <a
            href="https://wa.me/41765288403"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300"
            data-testid="footer-whatsapp"
          >
            <MessageCircle size={18} />
          </a>
          <a
            href="https://t.me/Hoohlya"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300"
            data-testid="footer-telegram"
          >
            <Send size={18} />
          </a>
          <a
            href="https://www.instagram.com/hoohlyashop"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300"
            data-testid="footer-instagram"
          >
            <Instagram size={18} />
          </a>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs uppercase tracking-wider">
          <Link to="/" className="text-white/50 hover:text-white transition-colors">
            {language === 'de' ? 'Startseite' : 'Home'}
          </Link>
          <Link to="/catalog" className="text-white/50 hover:text-white transition-colors">
            {language === 'de' ? 'Katalog' : 'Catalog'}
          </Link>
          <Link to="/reviews" className="text-white/50 hover:text-white transition-colors">
            {language === 'de' ? 'Bewertungen' : 'Reviews'}
          </Link>
          <Link to="/admin" className="text-white/50 hover:text-white transition-colors">
            Admin
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-white/30">
          © {new Date().getFullYear()} HooHlyaShop. {language === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
