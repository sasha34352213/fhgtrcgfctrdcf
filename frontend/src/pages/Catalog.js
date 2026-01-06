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
    <div className="min-h-screen pt-20 md:pt-24" data-testid="catalog-page">
      {/* Header */}
      <div className="py-12 md:py-16 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl"
          >
            {t('catalog.title')}
          </motion.h1>
        </div>
      </div>

      {/* Filters */}
      <div className="py-6 border-b border-white/10 sticky top-16 md:top-20 z-40 glass" data-testid="filters">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                type="text"
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-transparent focus:border-[#CCFF00] h-10 font-mono text-sm"
                data-testid="search-input"
              />
            </div>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-transparent h-10 font-mono text-sm" data-testid="brand-filter">
                <SelectValue placeholder={t('catalog.allBrands')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all" className="font-mono text-sm">{t('catalog.allBrands')}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="font-mono text-sm">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48 bg-[#1a1a1a] border-transparent h-10 font-mono text-sm" data-testid="category-filter">
                <SelectValue placeholder={t('catalog.allCategories')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all" className="font-mono text-sm">{t('catalog.allCategories')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="font-mono text-sm">
                    {getCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-[#CCFF00] transition-colors duration-300"
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
      <div className="py-8 md:py-12">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/50 font-mono">{t('catalog.noProducts')}</p>
            </div>
          ) : (
            <div className="tetris-grid" data-testid="products-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brand={getBrandForProduct(product)}
                  isLarge={index === 0}
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
