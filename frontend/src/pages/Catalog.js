import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Catalog = () => {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/categories`)
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API}/products?`;
        if (selectedBrand && selectedBrand !== 'all') {
          url += `brand_id=${selectedBrand}&`;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          url += `category_id=${selectedCategory}&`;
        }
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        const response = await axios.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedBrand, selectedCategory, searchQuery]);

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    if (value === 'all') {
      searchParams.delete('brand');
    } else {
      searchParams.set('brand', value);
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const getBrandForProduct = (product) => {
    return brands.find(b => b.id === product.brand_id);
  };

  const getCategoryName = (cat) => {
    return language === 'de' && cat.name_de ? cat.name_de : cat.name;
  };

  const hasFilters = selectedBrand !== 'all' || selectedCategory !== 'all' || searchQuery;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-[#141414]" data-testid="catalog-page">
      {/* Header */}
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-6xl text-white text-center"
          >
            {language === 'de' ? 'KATALOG' : 'CATALOG'}
          </motion.h1>
        </div>
      </div>

      {/* Filters */}
      <div className="py-6 border-y border-white/10 sticky top-16 md:top-20 z-40 bg-[#141414]" data-testid="filters">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-center">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                type="text"
                placeholder={language === 'de' ? 'Suchen...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-white/10 focus:border-white/30 h-10 text-sm text-white placeholder:text-white/30"
                data-testid="search-input"
              />
            </div>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-white/10 h-10 text-sm text-white" data-testid="brand-filter">
                <SelectValue placeholder={language === 'de' ? 'Alle Marken' : 'All Brands'} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all" className="text-sm text-white">{language === 'de' ? 'Alle Marken' : 'All Brands'}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="text-sm text-white">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-white/10 h-10 text-sm text-white" data-testid="category-filter">
                <SelectValue placeholder={language === 'de' ? 'Alle Kategorien' : 'All Categories'} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all" className="text-sm text-white">{language === 'de' ? 'Alle Kategorien' : 'All Categories'}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-sm text-white">
                    {getCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 hover:text-white transition-colors duration-300"
                data-testid="clear-filters"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/50">{language === 'de' ? 'Keine Produkte gefunden' : 'No products found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brand={getBrandForProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
