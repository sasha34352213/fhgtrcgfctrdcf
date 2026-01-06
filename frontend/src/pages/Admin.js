import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderTree,
  MessageSquare,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('hoohlyashop-admin') === 'true';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Data
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // product, brand, category, review
  const [editItem, setEditItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({});

  const handleLogin = async () => {
    try {
      await axios.post(`${API}/admin/login`, { password });
      setIsLoggedIn(true);
      localStorage.setItem('hoohlyashop-admin', 'true');
      toast.success('Login successful');
    } catch (error) {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('hoohlyashop-admin');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/products/all`),
        axios.get(`${API}/brands`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/reviews/all`)
      ]);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    
    if (item) {
      if (type === 'product') {
        setFormData({
          ...item,
          images: item.images?.join('\n') || '',
          sizes: item.sizes?.join(', ') || ''
        });
      } else {
        setFormData({ ...item });
      }
    } else {
      // Default values for new items
      const defaults = {
        product: {
          name: '', name_de: '', description: '', description_de: '',
          brand_id: brands[0]?.id || '', category_id: categories[0]?.id || '',
          images: '', sizes: '', price_text: 'Price on request',
          price_text_de: 'Preis auf Anfrage', featured: false, active: true
        },
        brand: { name: '', name_de: '', logo_url: '' },
        category: { name: '', name_de: '', slug: '' },
        review: { text: '', text_de: '', author: '', image_url: '', rating: 5, active: true }
      };
      setFormData(defaults[type] || {});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      let data = { ...formData };
      
      if (modalType === 'product') {
        data.images = data.images?.split('\n').filter(url => url.trim()) || [];
        data.sizes = data.sizes?.split(',').map(s => s.trim()).filter(s => s) || [];
      }

      if (editItem) {
        await axios.put(`${API}/${modalType}s/${editItem.id}`, data);
        toast.success(`${modalType} updated`);
      } else {
        await axios.post(`${API}/${modalType}s`, data);
        toast.success(`${modalType} created`);
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`${API}/${type}s/${id}`);
      toast.success(`${type} deleted`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="admin-login">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10"
        >
          <h1 className="font-heading text-3xl mb-8 text-center">{t('admin.login')}</h1>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('admin.password')}
                className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00] h-12 pr-12"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                data-testid="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full h-12 btn-primary"
              data-testid="admin-login-btn"
            >
              {t('admin.enter')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: 'products', icon: Package, label: t('admin.products') },
    { id: 'brands', icon: Tags, label: t('admin.brands') },
    { id: 'categories', icon: FolderTree, label: t('admin.categories') },
    { id: 'reviews', icon: MessageSquare, label: t('admin.reviewsAdmin') },
  ];

  const getBrandName = (brandId) => {
    return brands.find(b => b.id === brandId)?.name || '-';
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || '-';
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="admin-panel">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-[#0a0a0a] border border-white/10 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[#CCFF00] text-black'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-300"
                  data-testid="logout-btn"
                >
                  <LogOut size={18} />
                  {t('admin.logout')}
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('admin.totalProducts'), value: products.length, icon: Package },
                  { label: t('admin.totalBrands'), value: brands.length, icon: Tags },
                  { label: t('admin.totalCategories'), value: categories.length, icon: FolderTree },
                  { label: t('admin.totalReviews'), value: reviews.length, icon: MessageSquare },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#0a0a0a] border border-white/10 p-6"
                  >
                    <stat.icon size={24} className="text-[#CCFF00] mb-4" />
                    <p className="font-heading text-3xl mb-1">{stat.value}</p>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-2xl">{t('admin.products')}</h2>
                  <Button onClick={() => openModal('product')} className="btn-primary" data-testid="add-product-btn">
                    <Plus size={18} className="mr-2" />
                    {t('admin.add')}
                  </Button>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-white/50">Image</th>
                          <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-white/50">{t('admin.name')}</th>
                          <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-white/50">{t('admin.brand')}</th>
                          <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-white/50">{t('admin.category')}</th>
                          <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-white/50">{t('admin.active')}</th>
                          <th className="text-right p-4 font-mono text-xs uppercase tracking-widest text-white/50">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`product-row-${product.id}`}>
                            <td className="p-4">
                              <div className="w-12 h-12 bg-[#1a1a1a]">
                                {product.images?.[0] && (
                                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-medium">{product.name}</td>
                            <td className="p-4 text-white/70">{getBrandName(product.brand_id)}</td>
                            <td className="p-4 text-white/70">{getCategoryName(product.category_id)}</td>
                            <td className="p-4">
                              {product.active ? (
                                <Check size={18} className="text-green-500" />
                              ) : (
                                <X size={18} className="text-red-500" />
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => openModal('product', product)}
                                className="text-white/50 hover:text-[#CCFF00] p-2"
                                data-testid={`edit-product-${product.id}`}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete('product', product.id)}
                                className="text-white/50 hover:text-red-500 p-2"
                                data-testid={`delete-product-${product.id}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Brands */}
            {activeTab === 'brands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-2xl">{t('admin.brands')}</h2>
                  <Button onClick={() => openModal('brand')} className="btn-primary" data-testid="add-brand-btn">
                    <Plus size={18} className="mr-2" />
                    {t('admin.add')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brands.map((brand) => (
                    <div key={brand.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex justify-between items-center" data-testid={`brand-row-${brand.id}`}>
                      <span className="font-medium">{brand.name}</span>
                      <div>
                        <button onClick={() => openModal('brand', brand)} className="text-white/50 hover:text-[#CCFF00] p-2">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete('brand', brand.id)} className="text-white/50 hover:text-red-500 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-2xl">{t('admin.categories')}</h2>
                  <Button onClick={() => openModal('category')} className="btn-primary" data-testid="add-category-btn">
                    <Plus size={18} className="mr-2" />
                    {t('admin.add')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex justify-between items-center" data-testid={`category-row-${cat.id}`}>
                      <div>
                        <span className="font-medium block">{cat.name}</span>
                        <span className="text-xs text-white/50 font-mono">{cat.slug}</span>
                      </div>
                      <div>
                        <button onClick={() => openModal('category', cat)} className="text-white/50 hover:text-[#CCFF00] p-2">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete('categor', cat.id)} className="text-white/50 hover:text-red-500 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-2xl">{t('admin.reviewsAdmin')}</h2>
                  <Button onClick={() => openModal('review')} className="btn-primary" data-testid="add-review-btn">
                    <Plus size={18} className="mr-2" />
                    {t('admin.add')}
                  </Button>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#0a0a0a] border border-white/10 p-4" data-testid={`review-row-${review.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white/70 mb-2">{review.text}</p>
                          <p className="text-xs font-mono text-[#CCFF00]">— {review.author}</p>
                        </div>
                        <div className="flex">
                          <button onClick={() => openModal('review', review)} className="text-white/50 hover:text-[#CCFF00] p-2">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete('review', review.id)} className="text-white/50 hover:text-red-500 p-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" data-testid="admin-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl">
                {editItem ? t('admin.edit') : t('admin.add')} {modalType}
              </h3>
              <button onClick={closeModal} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Form */}
              {modalType === 'product' && (
                <>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.name')} *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.nameDe')}</label>
                    <Input
                      value={formData.name_de || ''}
                      onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.description')}</label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.descriptionDe')}</label>
                    <Textarea
                      value={formData.description_de || ''}
                      onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.brand')}</label>
                      <Select value={formData.brand_id || ''} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                        <SelectTrigger className="bg-[#1a1a1a] border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.category')}</label>
                      <Select value={formData.category_id || ''} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger className="bg-[#1a1a1a] border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.images')}</label>
                    <Textarea
                      value={formData.images || ''}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.sizes')}</label>
                    <Input
                      value={formData.sizes || ''}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.featured || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <span className="text-sm">{t('admin.featured')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.active !== false}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <span className="text-sm">{t('admin.active')}</span>
                    </label>
                  </div>
                </>
              )}

              {/* Brand Form */}
              {modalType === 'brand' && (
                <>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.name')} *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.nameDe')}</label>
                    <Input
                      value={formData.name_de || ''}
                      onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                </>
              )}

              {/* Category Form */}
              {modalType === 'category' && (
                <>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.name')} *</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.nameDe')}</label>
                    <Input
                      value={formData.name_de || ''}
                      onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.slug')} *</label>
                    <Input
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                      placeholder="clothing"
                    />
                  </div>
                </>
              )}

              {/* Review Form */}
              {modalType === 'review' && (
                <>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.text')} *</label>
                    <Textarea
                      value={formData.text || ''}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.textDe')}</label>
                    <Textarea
                      value={formData.text_de || ''}
                      onChange={(e) => setFormData({ ...formData, text_de: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.author')}</label>
                    <Input
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.imageUrl')}</label>
                    <Input
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-[#1a1a1a] border-transparent focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">{t('admin.rating')}</label>
                    <Select value={String(formData.rating || 5)} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                      <SelectTrigger className="bg-[#1a1a1a] border-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.active !== false}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <span className="text-sm">{t('admin.active')}</span>
                  </label>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button onClick={closeModal} variant="outline" className="flex-1 btn-secondary">
                  {t('admin.cancel')}
                </Button>
                <Button onClick={handleSave} className="flex-1 btn-primary" data-testid="save-btn">
                  {t('admin.save')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
