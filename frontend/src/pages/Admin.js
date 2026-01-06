import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  EyeOff,
  Upload,
  Image as ImageIcon,
  GripVertical,
  ChevronLeft,
  Menu,
  Save,
  Loader2
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

// Image Upload Component with Drag & Drop
const ImageUploader = ({ images, setImages, multiple = true }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newImages = [];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const url = await uploadFile(file);
        if (url) newImages.push(url);
      }
    }
    
    if (multiple) {
      setImages([...images, ...newImages]);
    } else {
      setImages(newImages.slice(0, 1));
    }
    
    setUploading(false);
    if (newImages.length > 0) {
      toast.success(`${newImages.length} image(s) uploaded`);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [images]);

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleReorder = (newOrder) => {
    setImages(newOrder);
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          dragActive ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="animate-spin text-white/50" />
            <p className="text-sm text-white/50">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-white/50" />
            <p className="text-sm text-white/70">
              Drag & drop images here
            </p>
            <p className="text-xs text-white/40">
              or tap to select from gallery
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid with Reorder */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 uppercase tracking-wider">
            {multiple ? 'Drag to reorder • Tap X to remove' : 'Uploaded image'}
          </p>
          
          {multiple ? (
            <Reorder.Group
              axis="x"
              values={images}
              onReorder={handleReorder}
              className="flex flex-wrap gap-2"
            >
              {images.map((url, index) => (
                <Reorder.Item
                  key={url}
                  value={url}
                  className="relative group cursor-grab active:cursor-grabbing"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#262626] rounded overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={14} className="text-white/70" />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="flex gap-2">
              {images.map((url, index) => (
                <div key={url} className="relative">
                  <div className="w-20 h-20 bg-[#262626] rounded overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Form Field Component
const FormField = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-white/50 block">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

// Language Tabs Component
const LanguageTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-2 mb-4">
    {['EN', 'DE'].map((lang) => (
      <button
        key={lang}
        type="button"
        onClick={() => setActiveTab(lang.toLowerCase())}
        className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all duration-300 ${
          activeTab === lang.toLowerCase()
            ? 'bg-white text-black border-white'
            : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
        }`}
      >
        {lang}
      </button>
    ))}
  </div>
);

const Admin = () => {
  const { language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('hoohlyashop-admin') === 'true';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Edit Mode
  const [editMode, setEditMode] = useState(null); // null, 'add', 'edit'
  const [editType, setEditType] = useState(''); // product, brand, category, review
  const [editItem, setEditItem] = useState(null);
  const [langTab, setLangTab] = useState('en');

  // Form Data
  const [form, setForm] = useState({});
  const [formImages, setFormImages] = useState([]);
  const [formLogo, setFormLogo] = useState([]);
  const [formReviewImage, setFormReviewImage] = useState([]);
  const [saving, setSaving] = useState(false);

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

  const openAddForm = (type) => {
    setEditMode('add');
    setEditType(type);
    setEditItem(null);
    setLangTab('en');
    setSidebarOpen(false);
    
    const defaults = {
      product: {
        name: '', name_de: '', description: '', description_de: '',
        brand_id: brands[0]?.id || '', category_id: categories[0]?.id || '',
        sizes: '', price_text: 'Price on request', price_text_de: 'Preis auf Anfrage',
        featured: false, active: true
      },
      brand: { name: '', name_de: '' },
      category: { name: '', name_de: '', slug: '' },
      review: { text: '', text_de: '', author: '', rating: 5, active: true }
    };
    
    setForm(defaults[type] || {});
    setFormImages([]);
    setFormLogo([]);
    setFormReviewImage([]);
  };

  const openEditForm = (type, item) => {
    setEditMode('edit');
    setEditType(type);
    setEditItem(item);
    setLangTab('en');
    setSidebarOpen(false);
    
    setForm({ ...item, sizes: item.sizes?.join(', ') || '' });
    setFormImages(item.images || []);
    setFormLogo(item.logo_url ? [item.logo_url] : []);
    setFormReviewImage(item.image_url ? [item.image_url] : []);
  };

  const closeForm = () => {
    setEditMode(null);
    setEditType('');
    setEditItem(null);
    setForm({});
    setFormImages([]);
    setFormLogo([]);
    setFormReviewImage([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let data = { ...form };
      
      if (editType === 'product') {
        data.images = formImages;
        data.sizes = data.sizes?.split(',').map(s => s.trim()).filter(s => s) || [];
      } else if (editType === 'brand') {
        data.logo_url = formLogo[0] || null;
      } else if (editType === 'review') {
        data.image_url = formReviewImage[0] || null;
      }

      if (editMode === 'edit' && editItem) {
        await axios.put(`${API}/${editType}s/${editItem.id}`, data);
        toast.success(`${editType} updated successfully`);
      } else {
        await axios.post(`${API}/${editType}s`, data);
        toast.success(`${editType} created successfully`);
      }
      
      closeForm();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    
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
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#141414] px-4" data-testid="admin-login">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-6 bg-[#1a1a1a] border border-white/10 rounded-lg"
        >
          <h1 className="font-heading text-2xl text-white text-center mb-6">ADMIN LOGIN</h1>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-[#262626] border-white/10 focus:border-white/30 h-12 pr-12 text-white"
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
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium uppercase tracking-wider rounded"
              data-testid="admin-login-btn"
            >
              Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Edit Form View
  if (editMode) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 bg-[#141414]" data-testid="admin-form">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={closeForm}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <h1 className="font-heading text-xl md:text-2xl text-white">
              {editMode === 'add' ? 'Add' : 'Edit'} {editType}
            </h1>
          </div>

          {/* Form */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 md:p-6 space-y-6">
            {/* Product Form */}
            {editType === 'product' && (
              <>
                <LanguageTabs activeTab={langTab} setActiveTab={setLangTab} />
                
                {langTab === 'en' ? (
                  <>
                    <FormField label="Product Name" required>
                      <Input
                        value={form.name || ''}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Air Jordan 1 Retro"
                        className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                      />
                    </FormField>
                    <FormField label="Description">
                      <Textarea
                        value={form.description || ''}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Product description in English"
                        rows={4}
                        className="bg-[#262626] border-white/10 focus:border-white/30 text-white resize-none"
                      />
                    </FormField>
                    <FormField label="Price Text">
                      <Input
                        value={form.price_text || ''}
                        onChange={(e) => setForm({ ...form, price_text: e.target.value })}
                        placeholder="e.g. Price on request"
                        className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                      />
                    </FormField>
                  </>
                ) : (
                  <>
                    <FormField label="Product Name (German)">
                      <Input
                        value={form.name_de || ''}
                        onChange={(e) => setForm({ ...form, name_de: e.target.value })}
                        placeholder="Produktname auf Deutsch"
                        className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                      />
                    </FormField>
                    <FormField label="Description (German)">
                      <Textarea
                        value={form.description_de || ''}
                        onChange={(e) => setForm({ ...form, description_de: e.target.value })}
                        placeholder="Produktbeschreibung auf Deutsch"
                        rows={4}
                        className="bg-[#262626] border-white/10 focus:border-white/30 text-white resize-none"
                      />
                    </FormField>
                    <FormField label="Price Text (German)">
                      <Input
                        value={form.price_text_de || ''}
                        onChange={(e) => setForm({ ...form, price_text_de: e.target.value })}
                        placeholder="z.B. Preis auf Anfrage"
                        className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                      />
                    </FormField>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Brand" required>
                    <Select 
                      value={form.brand_id || ''} 
                      onValueChange={(value) => setForm({ ...form, brand_id: value })}
                    >
                      <SelectTrigger className="bg-[#262626] border-white/10 h-12 text-white">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-white/10">
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id} className="text-white">
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Category" required>
                    <Select 
                      value={form.category_id || ''} 
                      onValueChange={(value) => setForm({ ...form, category_id: value })}
                    >
                      <SelectTrigger className="bg-[#262626] border-white/10 h-12 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-white/10">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField label="Sizes (comma separated)">
                  <Input
                    value={form.sizes || ''}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="e.g. S, M, L, XL or 40, 41, 42, 43"
                    className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                  />
                </FormField>

                <FormField label="Product Images">
                  <ImageUploader images={formImages} setImages={setFormImages} multiple={true} />
                </FormField>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={form.featured || false}
                      onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                      className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <span className="text-sm text-white">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={form.active !== false}
                      onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                      className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <span className="text-sm text-white">Active (visible in catalog)</span>
                  </label>
                </div>
              </>
            )}

            {/* Brand Form */}
            {editType === 'brand' && (
              <>
                <LanguageTabs activeTab={langTab} setActiveTab={setLangTab} />
                
                {langTab === 'en' ? (
                  <FormField label="Brand Name" required>
                    <Input
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Nike"
                      className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                    />
                  </FormField>
                ) : (
                  <FormField label="Brand Name (German)">
                    <Input
                      value={form.name_de || ''}
                      onChange={(e) => setForm({ ...form, name_de: e.target.value })}
                      placeholder="Markenname auf Deutsch"
                      className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                    />
                  </FormField>
                )}

                <FormField label="Brand Logo (optional)">
                  <ImageUploader images={formLogo} setImages={setFormLogo} multiple={false} />
                </FormField>
              </>
            )}

            {/* Category Form */}
            {editType === 'category' && (
              <>
                <LanguageTabs activeTab={langTab} setActiveTab={setLangTab} />
                
                {langTab === 'en' ? (
                  <FormField label="Category Name" required>
                    <Input
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Clothing"
                      className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                    />
                  </FormField>
                ) : (
                  <FormField label="Category Name (German)">
                    <Input
                      value={form.name_de || ''}
                      onChange={(e) => setForm({ ...form, name_de: e.target.value })}
                      placeholder="z.B. Kleidung"
                      className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                    />
                  </FormField>
                )}

                <FormField label="Slug" required>
                  <Input
                    value={form.slug || ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. clothing"
                    className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                  />
                  <p className="text-xs text-white/40 mt-1">URL-friendly name (no spaces, lowercase)</p>
                </FormField>
              </>
            )}

            {/* Review Form */}
            {editType === 'review' && (
              <>
                <LanguageTabs activeTab={langTab} setActiveTab={setLangTab} />
                
                {langTab === 'en' ? (
                  <FormField label="Review Text" required>
                    <Textarea
                      value={form.text || ''}
                      onChange={(e) => setForm({ ...form, text: e.target.value })}
                      placeholder="Customer review text"
                      rows={4}
                      className="bg-[#262626] border-white/10 focus:border-white/30 text-white resize-none"
                    />
                  </FormField>
                ) : (
                  <FormField label="Review Text (German)">
                    <Textarea
                      value={form.text_de || ''}
                      onChange={(e) => setForm({ ...form, text_de: e.target.value })}
                      placeholder="Bewertungstext auf Deutsch"
                      rows={4}
                      className="bg-[#262626] border-white/10 focus:border-white/30 text-white resize-none"
                    />
                  </FormField>
                )}

                <FormField label="Customer Name">
                  <Input
                    value={form.author || ''}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Marco S."
                    className="bg-[#262626] border-white/10 focus:border-white/30 h-12 text-white"
                  />
                </FormField>

                <FormField label="Rating">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, rating: n })}
                        className={`w-10 h-10 flex items-center justify-center border rounded transition-all ${
                          (form.rating || 5) >= n
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-white/40 border-white/20'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Review Image (screenshot)">
                  <ImageUploader images={formReviewImage} setImages={setFormReviewImage} multiple={false} />
                </FormField>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.active !== false}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <span className="text-sm text-white">Active (visible on website)</span>
                </label>
              </>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium uppercase tracking-wider rounded"
                data-testid="save-btn"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={18} />
                    Save {editType}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'brands', icon: Tags, label: 'Brands' },
    { id: 'categories', icon: FolderTree, label: 'Categories' },
    { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
  ];

  const getBrandName = (brandId) => brands.find(b => b.id === brandId)?.name || '-';
  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || '-';

  // Main Admin View
  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-[#141414]" data-testid="admin-panel">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#141414] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded bg-[#1a1a1a] border border-white/10"
        >
          <Menu size={20} className="text-white" />
        </button>
        <span className="font-heading text-lg text-white">{tabs.find(t => t.id === activeTab)?.label}</span>
        <div className="w-10" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/70"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#141414] border-r border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-heading text-xl text-white">ADMIN</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} className="text-white" />
                </button>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-colors duration-300 rounded ${
                      activeTab === tab.id
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0 h-[calc(100vh-5rem)] sticky top-20 border-r border-white/10 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-colors duration-300 rounded ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/5'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded"
              data-testid="logout-btn"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 md:p-6 mt-14 md:mt-0">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl text-white">Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Products', value: products.length, icon: Package },
                  { label: 'Brands', value: brands.length, icon: Tags },
                  { label: 'Categories', value: categories.length, icon: FolderTree },
                  { label: 'Reviews', value: reviews.length, icon: MessageSquare },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#1a1a1a] border border-white/10 p-4 md:p-6 rounded-lg"
                  >
                    <stat.icon size={24} className="text-white/50 mb-3" />
                    <p className="font-heading text-3xl text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-white">Products</h2>
                <Button onClick={() => openAddForm('product')} className="btn-primary h-10" data-testid="add-product-btn">
                  <Plus size={18} className="mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 flex gap-3"
                    data-testid={`product-row-${product.id}`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-[#262626] rounded overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={20} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-white font-medium truncate">{product.name}</h3>
                      <p className="text-xs text-white/50">{getBrandName(product.brand_id)} • {getCategoryName(product.category_id)}</p>
                      <div className="flex gap-2 mt-2">
                        {product.featured && (
                          <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded">Featured</span>
                        )}
                        {!product.active && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Hidden</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEditForm('product', product)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={16} className="text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDelete('product', product.id, product.name)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} className="text-white/70 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-white">Brands</h2>
                <Button onClick={() => openAddForm('brand')} className="btn-primary h-10" data-testid="add-brand-btn">
                  <Plus size={18} className="mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 flex items-center justify-between"
                    data-testid={`brand-row-${brand.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {brand.logo_url ? (
                        <div className="w-10 h-10 bg-[#262626] rounded overflow-hidden">
                          <img src={brand.logo_url} alt="" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[#262626] rounded flex items-center justify-center">
                          <Tags size={18} className="text-white/30" />
                        </div>
                      )}
                      <div>
                        <span className="text-white font-medium">{brand.name}</span>
                        <p className="text-xs text-white/40">
                          {products.filter(p => p.brand_id === brand.id).length} products
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm('brand', brand)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={16} className="text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDelete('brand', brand.id, brand.name)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} className="text-white/70 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-white">Categories</h2>
                <Button onClick={() => openAddForm('category')} className="btn-primary h-10" data-testid="add-category-btn">
                  <Plus size={18} className="mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 flex items-center justify-between"
                    data-testid={`category-row-${cat.id}`}
                  >
                    <div>
                      <span className="text-white font-medium">{cat.name}</span>
                      {cat.name_de && <span className="text-white/40 text-sm ml-2">/ {cat.name_de}</span>}
                      <p className="text-xs text-white/40">
                        /{cat.slug} • {products.filter(p => p.category_id === cat.id).length} products
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm('category', cat)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={16} className="text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDelete('category', cat.id, cat.name)}
                        className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={16} className="text-white/70 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-white">Reviews</h2>
                <Button onClick={() => openAddForm('review')} className="btn-primary h-10" data-testid="add-review-btn">
                  <Plus size={18} className="mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4"
                    data-testid={`review-row-${review.id}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{review.author || 'Anonymous'}</span>
                          <span className="text-xs text-white/40">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                          {!review.active && (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Hidden</span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm line-clamp-2">{review.text}</p>
                      </div>
                      {review.image_url && (
                        <div className="w-16 h-16 flex-shrink-0 bg-[#262626] rounded overflow-hidden">
                          <img src={review.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openEditForm('review', review)}
                          className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Pencil size={16} className="text-white/70" />
                        </button>
                        <button
                          onClick={() => handleDelete('review', review.id, review.author)}
                          className="w-9 h-9 flex items-center justify-center rounded bg-white/5 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={16} className="text-white/70 hover:text-red-400" />
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
  );
};

export default Admin;
