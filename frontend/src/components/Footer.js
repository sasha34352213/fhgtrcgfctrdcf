import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, Send, Instagram } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  const contactLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/41765288403',
      className: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: Send,
      href: 'https://t.me/Hoohlya',
      className: 'telegram'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://www.instagram.com/hoohlyashop',
      className: 'instagram'
    }
  ];

  return (
    <footer className="border-t border-white/10 py-16" data-testid="footer">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-heading text-2xl tracking-wider text-white">
                HOOHLYA<span className="text-[#CCFF00]">SHOP</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Premium streetwear & luxury fashion. Curated collection of Nike, Adidas, Gucci, Louis Vuitton & Stone Island.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors duration-300">
                {t('nav.home')}
              </Link>
              <Link to="/catalog" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors duration-300">
                {t('nav.catalog')}
              </Link>
              <Link to="/reviews" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors duration-300">
                {t('nav.reviews')}
              </Link>
              <Link to="/cart" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors duration-300">
                {t('nav.cart')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">{t('footer.contact')}</h4>
            <div className="flex flex-col gap-3">
              {contactLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`contact-btn ${link.className}`}
                  data-testid={`footer-${link.className}`}
                >
                  <link.icon size={16} strokeWidth={1.5} />
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30 font-mono">
            © {new Date().getFullYear()} HooHlyaShop. {t('footer.rights')}.
          </p>
          <Link
            to="/admin"
            className="text-xs text-white/30 font-mono hover:text-white/50 transition-colors duration-300"
            data-testid="admin-link"
          >
            {t('nav.admin')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
