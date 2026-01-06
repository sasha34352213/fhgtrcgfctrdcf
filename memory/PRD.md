# HooHlyaShop - Fashion Catalog Website PRD

## Project Overview
A premium fashion catalog website (semi-ecommerce) that functions as an online store visually but operates as a catalog with manual order processing through messenger communication.

## User Personas
1. **Fashion Shoppers** - Browse premium streetwear, add items to cart, generate PDF orders
2. **Store Admin** - Manage products, brands, categories, and reviews via admin panel
3. **International Customers** - German/English speakers using multilingual interface

## Core Requirements (Static)
- Premium black/dark theme with acid lime (#CCFF00) accents
- Product catalog with brand/category filters
- Shopping cart with PDF order generation
- Contact via WhatsApp, Telegram, Instagram
- EN/DE language support
- Admin panel for content management
- No online payments - orders completed via messenger

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI (Python) with MongoDB
- **PDF Generation**: ReportLab (server-side)
- **Fonts**: Anton (headings) + Manrope (body)

## What's Been Implemented
### Phase 1 (Completed - January 2026)
- [x] Homepage with hero section, how-it-works, featured brands
- [x] Product catalog with tetris grid layout
- [x] Brand/category/search filters
- [x] Product detail pages with image gallery, sizes, add to cart
- [x] Shopping cart with quantity controls
- [x] PDF order generation with order numbers
- [x] Order success page with download PDF + contact buttons
- [x] Customer reviews page
- [x] EN/DE language switcher (full translation)
- [x] Admin login (password protected)
- [x] Admin dashboard with statistics
- [x] Admin CRUD for products, brands, categories, reviews
- [x] Seed data (Nike, Adidas, Gucci, LV, Stone Island)
- [x] WhatsApp/Telegram/Instagram contact buttons
- [x] Responsive design (mobile-first)
- [x] Dark theme with premium streetwear aesthetic

## Contact Configuration
- WhatsApp: +41765288403
- Telegram: @Hoohlya  
- Instagram: @hoohlyashop

## Admin Access
- URL: /admin
- Password: hoohlyaadmin2024

## Prioritized Backlog

### P0 (Critical) - Done
- All core features implemented

### P1 (High Priority) - Future
- Product image upload (currently uses URLs)
- Order history in admin panel
- Email notifications for new orders
- Product stock management

### P2 (Medium Priority) - Future
- Product search suggestions/autocomplete
- Recently viewed products
- Wishlist functionality
- Customer accounts
- Size guide per product

### P3 (Nice to Have) - Future
- Product videos
- AR try-on for accessories
- Social sharing buttons
- Newsletter subscription
- Blog section for fashion content

## Next Action Items
1. Add product image upload functionality in admin
2. Create orders management section in admin panel
3. Set up email notifications via SendGrid/Resend
4. Add product stock/availability tracking
