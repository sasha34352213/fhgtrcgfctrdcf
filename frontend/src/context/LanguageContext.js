import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      reviews: 'Reviews',
      cart: 'Cart',
      admin: 'Admin'
    },
    hero: {
      title: 'PREMIUM STREETWEAR',
      subtitle: 'Exclusive Fashion Collection',
      cta: 'Explore Catalog',
      description: 'Curated selection of Nike, Adidas, Gucci, LV & Stone Island'
    },
    howItWorks: {
      title: 'HOW IT WORKS',
      step1: 'Browse & Select',
      step1Desc: 'Explore our curated collection of premium streetwear and add items to your cart',
      step2: 'Generate Order',
      step2Desc: 'Complete your cart and generate a PDF with your order details',
      step3: 'Contact Us',
      step3Desc: 'Send the PDF via WhatsApp, Telegram, or Instagram to complete your order'
    },
    brands: {
      title: 'FEATURED BRANDS',
      viewAll: 'View All'
    },
    catalog: {
      title: 'CATALOG',
      all: 'All',
      allBrands: 'All Brands',
      allCategories: 'All Categories',
      search: 'Search products...',
      noProducts: 'No products found',
      priceOnRequest: 'Price on request'
    },
    product: {
      addToCart: 'Add to Cart',
      selectSize: 'Select Size',
      description: 'Description',
      contactUs: 'Contact Us'
    },
    cart: {
      title: 'YOUR CART',
      empty: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      checkout: 'Checkout',
      name: 'Your Name',
      contact: 'Contact (optional)',
      comment: 'Order Comment (optional)',
      generateOrder: 'Generate Order PDF',
      quantity: 'Qty'
    },
    order: {
      success: 'Order Created!',
      orderNumber: 'Order Number',
      downloadPdf: 'Download PDF',
      instruction: 'Please send this PDF to complete your order via:',
      newOrder: 'Start New Order'
    },
    reviews: {
      title: 'CUSTOMER REVIEWS',
      subtitle: 'What our customers say'
    },
    footer: {
      contact: 'Contact Us',
      rights: 'All rights reserved'
    },
    admin: {
      login: 'Admin Login',
      password: 'Password',
      enter: 'Enter',
      dashboard: 'Dashboard',
      products: 'Products',
      brands: 'Brands',
      categories: 'Categories',
      reviewsAdmin: 'Reviews',
      logout: 'Logout',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      name: 'Name',
      nameDe: 'Name (German)',
      description: 'Description',
      descriptionDe: 'Description (German)',
      brand: 'Brand',
      category: 'Category',
      images: 'Images (URLs, one per line)',
      sizes: 'Sizes (comma separated)',
      featured: 'Featured',
      active: 'Active',
      author: 'Author',
      text: 'Review Text',
      textDe: 'Review Text (German)',
      rating: 'Rating',
      imageUrl: 'Image URL',
      slug: 'Slug',
      totalProducts: 'Total Products',
      totalBrands: 'Total Brands',
      totalCategories: 'Total Categories',
      totalReviews: 'Total Reviews'
    }
  },
  de: {
    nav: {
      home: 'Startseite',
      catalog: 'Katalog',
      reviews: 'Bewertungen',
      cart: 'Warenkorb',
      admin: 'Admin'
    },
    hero: {
      title: 'PREMIUM STREETWEAR',
      subtitle: 'Exklusive Mode Kollektion',
      cta: 'Katalog Entdecken',
      description: 'Kuratierte Auswahl von Nike, Adidas, Gucci, LV & Stone Island'
    },
    howItWorks: {
      title: 'SO FUNKTIONIERT ES',
      step1: 'Stöbern & Auswählen',
      step1Desc: 'Entdecken Sie unsere kuratierte Kollektion premium Streetwear und fügen Sie Artikel in Ihren Warenkorb',
      step2: 'Bestellung Generieren',
      step2Desc: 'Vervollständigen Sie Ihren Warenkorb und generieren Sie ein PDF mit Ihren Bestelldetails',
      step3: 'Kontaktieren Sie Uns',
      step3Desc: 'Senden Sie das PDF per WhatsApp, Telegram oder Instagram, um Ihre Bestellung abzuschließen'
    },
    brands: {
      title: 'MARKEN',
      viewAll: 'Alle Ansehen'
    },
    catalog: {
      title: 'KATALOG',
      all: 'Alle',
      allBrands: 'Alle Marken',
      allCategories: 'Alle Kategorien',
      search: 'Produkte suchen...',
      noProducts: 'Keine Produkte gefunden',
      priceOnRequest: 'Preis auf Anfrage'
    },
    product: {
      addToCart: 'In den Warenkorb',
      selectSize: 'Größe Wählen',
      description: 'Beschreibung',
      contactUs: 'Kontaktieren Sie Uns'
    },
    cart: {
      title: 'IHR WARENKORB',
      empty: 'Ihr Warenkorb ist leer',
      continueShopping: 'Weiter Einkaufen',
      remove: 'Entfernen',
      checkout: 'Zur Kasse',
      name: 'Ihr Name',
      contact: 'Kontakt (optional)',
      comment: 'Bestellkommentar (optional)',
      generateOrder: 'Bestellungs-PDF Generieren',
      quantity: 'Menge'
    },
    order: {
      success: 'Bestellung Erstellt!',
      orderNumber: 'Bestellnummer',
      downloadPdf: 'PDF Herunterladen',
      instruction: 'Bitte senden Sie dieses PDF, um Ihre Bestellung abzuschließen über:',
      newOrder: 'Neue Bestellung'
    },
    reviews: {
      title: 'KUNDENBEWERTUNGEN',
      subtitle: 'Was unsere Kunden sagen'
    },
    footer: {
      contact: 'Kontaktieren Sie Uns',
      rights: 'Alle Rechte vorbehalten'
    },
    admin: {
      login: 'Admin Anmeldung',
      password: 'Passwort',
      enter: 'Eintreten',
      dashboard: 'Dashboard',
      products: 'Produkte',
      brands: 'Marken',
      categories: 'Kategorien',
      reviewsAdmin: 'Bewertungen',
      logout: 'Abmelden',
      add: 'Hinzufügen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      name: 'Name',
      nameDe: 'Name (Deutsch)',
      description: 'Beschreibung',
      descriptionDe: 'Beschreibung (Deutsch)',
      brand: 'Marke',
      category: 'Kategorie',
      images: 'Bilder (URLs, eine pro Zeile)',
      sizes: 'Größen (kommagetrennt)',
      featured: 'Hervorgehoben',
      active: 'Aktiv',
      author: 'Autor',
      text: 'Bewertungstext',
      textDe: 'Bewertungstext (Deutsch)',
      rating: 'Bewertung',
      imageUrl: 'Bild URL',
      slug: 'Slug',
      totalProducts: 'Produkte Gesamt',
      totalBrands: 'Marken Gesamt',
      totalCategories: 'Kategorien Gesamt',
      totalReviews: 'Bewertungen Gesamt'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('hoohlyashop-language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('hoohlyashop-language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'de' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
