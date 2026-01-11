# HooHlyaShop - Fashion Catalog Website

A premium fashion catalog website for browsing products, generating PDF orders, and contacting sellers via WhatsApp/Telegram/Instagram.

## 📁 Project Structure

```
hoohlyashop/
├── backend/                 # FastAPI Python backend
│   ├── server.py           # Main API server
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── uploads/            # Uploaded images storage
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts (Cart, Language)
│   │   ├── App.js          # Main app component
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── .env.example        # Frontend environment template
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- Python 3.9+ (https://python.org)
- MongoDB (https://mongodb.com) - local or cloud (MongoDB Atlas)

### 1. Clone/Extract the Project
```bash
unzip hoohlyashop.zip
cd hoohlyashop
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)

# Run backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
yarn install  # or: npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Run development server
yarn start  # or: npm start
```

### 4. Access the Website
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Admin Panel: http://localhost:3000/admin (Password: 808206)

---

## ⚙️ Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"    # MongoDB connection string
DB_NAME="hoohlyashop"                     # Database name
CORS_ORIGINS="*"                          # Allowed origins
ADMIN_PASSWORD="808206"                   # Admin panel password
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL="http://localhost:8001"  # Backend API URL
```

---

## 📝 How to Edit Products & Prices

### Via Admin Panel (Recommended)
1. Go to `/admin` on your website
2. Login with password: `808206`
3. Click "Products" tab
4. Click "Add" to create new product or pencil icon to edit
5. Fill in:
   - **Name**: Product name (English)
   - **Name (German)**: German translation
   - **Brand**: Select from dropdown
   - **Category**: Select from dropdown
   - **Price**: Enter price like "CHF 299.00"
   - **Images**: Drag & drop or click to upload
   - **Sizes**: Comma-separated (e.g., "S, M, L, XL")
6. Click "Save"

### Via Database (Advanced)
Products are stored in MongoDB `products` collection:
```javascript
{
  id: "unique-id",
  name: "Product Name",
  name_de: "German Name",
  description: "Description",
  brand_id: "brand-id",
  category_id: "category-id",
  images: ["url1", "url2"],
  sizes: ["S", "M", "L"],
  price_text: "CHF 299.00",
  price_text_de: "CHF 299.00",
  featured: true,
  active: true
}
```

---

## 🖼️ How to Replace Images

### Hero Image
Edit `frontend/src/pages/Home.js`, find the hero section and change the image URL:
```javascript
<img
  src="YOUR_NEW_IMAGE_URL"
  alt="HooHlya Shop"
  className="w-full h-full object-cover"
/>
```

### Product Images
1. Go to Admin Panel → Products
2. Click edit on a product
3. Remove old images (click X)
4. Upload new images via drag & drop

### Logo
The logo is text-based. To change it, edit `frontend/src/components/Header.js`:
```javascript
<span className="font-heading text-xl md:text-2xl tracking-wider text-white">
  YOUR SHOP NAME
</span>
```

---

## 🌐 Deployment Options

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

1. **Setup Server**
   ```bash
   # Install Node.js, Python, MongoDB
   sudo apt update
   sudo apt install nodejs npm python3 python3-pip mongodb
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Use gunicorn for production
   gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
   ```

3. **Build & Deploy Frontend**
   ```bash
   cd frontend
   yarn build
   # Serve with nginx or copy build/ to web server
   ```

4. **Setup Nginx** (example config)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /var/www/hoohlyashop/frontend/build;
           try_files $uri /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:8001;
       }
   }
   ```

### Option 2: Railway.app (Easy)

1. Create account at https://railway.app
2. Create new project
3. Add MongoDB service
4. Deploy backend from GitHub
5. Deploy frontend from GitHub
6. Set environment variables

### Option 3: Vercel + MongoDB Atlas

1. **Frontend on Vercel**
   - Push frontend to GitHub
   - Connect to Vercel
   - Set `REACT_APP_BACKEND_URL` env var

2. **Backend on Railway/Render**
   - Push backend to GitHub
   - Deploy to Railway or Render
   - Connect to MongoDB Atlas

3. **Database on MongoDB Atlas**
   - Create free cluster at https://mongodb.com/atlas
   - Get connection string
   - Update backend MONGO_URL

---

## 📱 Features

- ✅ Product catalog with filters (brand, category, search)
- ✅ Shopping cart with price calculation
- ✅ PDF order generation
- ✅ WhatsApp/Telegram/Instagram contact buttons
- ✅ Multilingual (English/German)
- ✅ Mobile responsive design
- ✅ Admin panel for content management
- ✅ Image upload with drag & drop
- ✅ Image carousel with swipe support

---

## 🔧 Customization

### Colors
Edit `frontend/src/index.css`:
```css
/* Main accent color (gold) */
.text-[#c9a962] { color: #c9a962; }
.bg-[#c9a962] { background: #c9a962; }

/* Background colors */
.bg-[#141414] { background: #141414; }  /* Main background */
.bg-[#1a1a1a] { background: #1a1a1a; }  /* Card background */
```

### Fonts
Fonts are loaded from Google Fonts in `index.css`:
- **Headings**: Bebas Neue
- **Body**: Inter

### Contact Links
Edit these files to change WhatsApp/Telegram/Instagram links:
- `frontend/src/components/Footer.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Cart.js`
- `frontend/src/pages/ProductDetail.js`

---

## 📞 Contact Information

Current configuration:
- WhatsApp: +41765288403
- Telegram: @Hoohlya
- Instagram: @hoohlyashop

---

## 📄 License

This project is yours to use, modify, and host freely. No platform lock-in.

---

## 🆘 Support

For technical support or customization requests, contact the developer.
