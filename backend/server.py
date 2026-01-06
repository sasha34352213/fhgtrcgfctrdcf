from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, UploadFile, File, Form
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import secrets
from io import BytesIO
import httpx
import base64
import aiofiles
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBasic()

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'hoohlyaadmin2024')

# Models
class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_de: str = ""
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrandCreate(BaseModel):
    name: str
    name_de: str = ""
    logo_url: Optional[str] = None

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_de: str
    slug: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    name_de: str
    slug: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_de: str = ""
    description: str = ""
    description_de: str = ""
    brand_id: str
    category_id: str
    images: List[str] = []
    sizes: List[str] = []
    price_text: str = "Price on request"
    price_text_de: str = "Preis auf Anfrage"
    featured: bool = False
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    name_de: str = ""
    description: str = ""
    description_de: str = ""
    brand_id: str
    category_id: str
    images: List[str] = []
    sizes: List[str] = []
    price_text: str = "Price on request"
    price_text_de: str = "Preis auf Anfrage"
    featured: bool = False
    active: bool = True

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    text_de: str = ""
    author: str = "Anonymous"
    image_url: Optional[str] = None
    rating: int = 5
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    text: str
    text_de: str = ""
    author: str = "Anonymous"
    image_url: Optional[str] = None
    rating: int = 5
    active: bool = True

class CartItem(BaseModel):
    product_id: str
    product_name: str
    brand_name: str
    quantity: int = 1
    size: Optional[str] = None
    image_url: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[CartItem]
    customer_name: str
    customer_contact: str = ""
    comment: str = ""
    language: str = "en"

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"HOO-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}")
    items: List[CartItem]
    customer_name: str
    customer_contact: str = ""
    comment: str = ""
    language: str = "en"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    password: str

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    if not secrets.compare_digest(credentials.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True

# Image Upload
@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return its URL"""
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
        
        # Generate unique filename
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = UPLOAD_DIR / filename
        
        # Read file content
        content = await file.read()
        
        # Optimize image
        try:
            img = PILImage.open(BytesIO(content))
            
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large (max 1200px width)
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), PILImage.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            content = output.getvalue()
            filename = f"{uuid.uuid4()}.jpg"
            filepath = UPLOAD_DIR / filename
        except Exception as e:
            logging.warning(f"Image optimization failed: {e}")
        
        # Save file
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(content)
        
        # Return the URL
        return {"url": f"/api/uploads/{filename}", "filename": filename}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/upload/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image"""
    filepath = UPLOAD_DIR / filename
    if filepath.exists():
        filepath.unlink()
        return {"success": True}
    raise HTTPException(status_code=404, detail="File not found")

# Admin Auth
@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    if secrets.compare_digest(login.password, ADMIN_PASSWORD):
        return {"success": True, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid password")

# Brands
@api_router.get("/brands", response_model=List[Brand])
async def get_brands():
    brands = await db.brands.find({}, {"_id": 0}).to_list(100)
    for b in brands:
        if isinstance(b.get('created_at'), str):
            b['created_at'] = datetime.fromisoformat(b['created_at'])
    return brands

@api_router.get("/brands/{brand_id}", response_model=Brand)
async def get_brand(brand_id: str):
    brand = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if isinstance(brand.get('created_at'), str):
        brand['created_at'] = datetime.fromisoformat(brand['created_at'])
    return brand

@api_router.post("/brands", response_model=Brand)
async def create_brand(brand_data: BrandCreate):
    brand = Brand(**brand_data.model_dump())
    doc = brand.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.brands.insert_one(doc)
    return brand

@api_router.put("/brands/{brand_id}", response_model=Brand)
async def update_brand(brand_id: str, brand_data: BrandCreate):
    existing = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Brand not found")
    update_data = brand_data.model_dump()
    await db.brands.update_one({"id": brand_id}, {"$set": update_data})
    updated = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str):
    result = await db.brands.delete_one({"id": brand_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"success": True}

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for c in categories:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return categories

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return category

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate):
    category = Category(**category_data.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate):
    existing = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = category_data.model_dump()
    await db.categories.update_one({"id": category_id}, {"$set": update_data})
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}

# Products
@api_router.get("/products", response_model=List[Product])
async def get_products(brand_id: Optional[str] = None, category_id: Optional[str] = None, featured: Optional[bool] = None, search: Optional[str] = None):
    query = {"active": True}
    if brand_id:
        query["brand_id"] = brand_id
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"name_de": {"$regex": search, "$options": "i"}}
        ]
    products = await db.products.find(query, {"_id": 0}).to_list(500)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/all", response_model=List[Product])
async def get_all_products():
    products = await db.products.find({}, {"_id": 0}).to_list(500)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = product_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}

# Reviews
@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(active_only: bool = True):
    query = {"active": True} if active_only else {}
    reviews = await db.reviews.find(query, {"_id": 0}).to_list(100)
    for r in reviews:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return reviews

@api_router.get("/reviews/all", response_model=List[Review])
async def get_all_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(100)
    for r in reviews:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate):
    review = Review(**review_data.model_dump())
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    return review

@api_router.put("/reviews/{review_id}", response_model=Review)
async def update_review(review_id: str, review_data: ReviewCreate):
    existing = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")
    update_data = review_data.model_dump()
    await db.reviews.update_one({"id": review_id}, {"$set": update_data})
    updated = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"success": True}

# Orders and PDF Generation
@api_router.post("/orders")
async def create_order(order_data: OrderCreate):
    order = Order(**order_data.model_dump())
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    for item in doc['items']:
        if 'image_url' not in item:
            item['image_url'] = None
    await db.orders.insert_one(doc)
    return {"order_id": order.id, "order_number": order.order_number}

@api_router.get("/orders/{order_id}/pdf")
async def generate_order_pdf(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    lang = order.get('language', 'en')
    is_de = lang == 'de'
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm, leftMargin=20*mm, rightMargin=20*mm)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.black, alignment=TA_CENTER, spaceAfter=20)
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=12, textColor=colors.grey, alignment=TA_CENTER, spaceAfter=5)
    info_style = ParagraphStyle('Info', parent=styles['Normal'], fontSize=10, textColor=colors.black, spaceAfter=3)
    product_style = ParagraphStyle('Product', parent=styles['Normal'], fontSize=11, textColor=colors.black)
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=30)
    
    elements = []
    
    elements.append(Paragraph("HOOHLYASHOP", title_style))
    elements.append(Paragraph("Premium Fashion Catalog" if not is_de else "Premium Mode Katalog", header_style))
    elements.append(Spacer(1, 10*mm))
    
    elements.append(Paragraph(f"<b>{'Order Number' if not is_de else 'Bestellnummer'}:</b> {order['order_number']}", info_style))
    created_at = order['created_at'] if isinstance(order['created_at'], str) else order['created_at'].isoformat()
    elements.append(Paragraph(f"<b>{'Date' if not is_de else 'Datum'}:</b> {created_at[:10]}", info_style))
    
    if order.get('customer_name'):
        elements.append(Paragraph(f"<b>{'Customer' if not is_de else 'Kunde'}:</b> {order['customer_name']}", info_style))
    if order.get('customer_contact'):
        elements.append(Paragraph(f"<b>{'Contact' if not is_de else 'Kontakt'}:</b> {order['customer_contact']}", info_style))
    if order.get('comment'):
        elements.append(Paragraph(f"<b>{'Comment' if not is_de else 'Kommentar'}:</b> {order['comment']}", info_style))
    
    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph(f"<b>{'ORDERED ITEMS' if not is_de else 'BESTELLTE ARTIKEL'}</b>", info_style))
    elements.append(Spacer(1, 5*mm))
    
    table_data = [['#', 'Product' if not is_de else 'Produkt', 'Brand' if not is_de else 'Marke', 'Size' if not is_de else 'Größe', 'Qty' if not is_de else 'Menge']]
    
    for idx, item in enumerate(order['items'], 1):
        table_data.append([
            str(idx),
            item['product_name'],
            item['brand_name'],
            item.get('size') or '-',
            str(item['quantity'])
        ])
    
    table = Table(table_data, colWidths=[15*mm, 70*mm, 40*mm, 25*mm, 20*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(table)
    
    elements.append(Spacer(1, 15*mm))
    
    contact_text = """
    <b>HOW TO COMPLETE YOUR ORDER / WIE SIE IHRE BESTELLUNG ABSCHLIESSEN</b><br/><br/>
    Please send this PDF to complete your order via:<br/>
    Bitte senden Sie dieses PDF, um Ihre Bestellung abzuschließen über:<br/><br/>
    WhatsApp: +41 76 528 84 03<br/>
    Telegram: @Hoohlya<br/>
    Instagram: @hoohlyashop
    """
    elements.append(Paragraph(contact_text, footer_style))
    
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=HooHlyaShop_Order_{order['order_number']}.pdf"}
    )

# Seed Data
@api_router.post("/seed")
async def seed_data():
    brands_count = await db.brands.count_documents({})
    if brands_count > 0:
        return {"message": "Data already seeded"}
    
    brands = [
        {"id": "brand-nike", "name": "Nike", "name_de": "Nike", "logo_url": None, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "brand-adidas", "name": "Adidas", "name_de": "Adidas", "logo_url": None, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "brand-lv", "name": "Louis Vuitton", "name_de": "Louis Vuitton", "logo_url": None, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "brand-gucci", "name": "Gucci", "name_de": "Gucci", "logo_url": None, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "brand-stone", "name": "Stone Island", "name_de": "Stone Island", "logo_url": None, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.brands.insert_many(brands)
    
    categories = [
        {"id": "cat-clothing", "name": "Clothing", "name_de": "Kleidung", "slug": "clothing", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cat-footwear", "name": "Footwear", "name_de": "Schuhe", "slug": "footwear", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cat-accessories", "name": "Accessories", "name_de": "Accessoires", "slug": "accessories", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.categories.insert_many(categories)
    
    products = [
        {"id": "prod-1", "name": "Air Jordan 1 Retro High", "name_de": "Air Jordan 1 Retro High", "description": "Iconic basketball silhouette with premium leather construction.", "description_de": "Ikonische Basketball-Silhouette mit hochwertigem Leder.", "brand_id": "brand-nike", "category_id": "cat-footwear", "images": ["https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg"], "sizes": ["40", "41", "42", "43", "44", "45"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": True, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-2", "name": "Ultraboost 22", "name_de": "Ultraboost 22", "description": "Revolutionary running shoes with responsive cushioning.", "description_de": "Revolutionäre Laufschuhe mit reaktionsschneller Dämpfung.", "brand_id": "brand-adidas", "category_id": "cat-footwear", "images": ["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"], "sizes": ["40", "41", "42", "43", "44"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": True, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-3", "name": "Tech Fleece Hoodie", "name_de": "Tech Fleece Kapuzenpullover", "description": "Lightweight warmth with a sleek, modern look.", "description_de": "Leichte Wärme mit einem eleganten, modernen Look.", "brand_id": "brand-nike", "category_id": "cat-clothing", "images": ["https://images.pexels.com/photos/10164855/pexels-photo-10164855.jpeg"], "sizes": ["S", "M", "L", "XL"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": True, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-4", "name": "Monogram Belt", "name_de": "Monogramm Gürtel", "description": "Signature LV monogram canvas with gold-tone buckle.", "description_de": "Signatur LV Monogramm Canvas mit goldfarbener Schnalle.", "brand_id": "brand-lv", "category_id": "cat-accessories", "images": ["https://images.pexels.com/photos/11496596/pexels-photo-11496596.jpeg"], "sizes": ["85cm", "90cm", "95cm", "100cm"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": False, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-5", "name": "GG Canvas Sneaker", "name_de": "GG Canvas Sneaker", "description": "Classic Gucci monogram on versatile canvas sneaker.", "description_de": "Klassisches Gucci Monogramm auf vielseitigem Canvas-Sneaker.", "brand_id": "brand-gucci", "category_id": "cat-footwear", "images": ["https://images.pexels.com/photos/5994299/pexels-photo-5994299.jpeg"], "sizes": ["40", "41", "42", "43", "44"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": True, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-6", "name": "Compass Badge Sweatshirt", "name_de": "Kompass-Abzeichen Sweatshirt", "description": "Iconic Stone Island sweatshirt with detachable compass badge.", "description_de": "Ikonisches Stone Island Sweatshirt mit abnehmbarem Kompass-Abzeichen.", "brand_id": "brand-stone", "category_id": "cat-clothing", "images": ["https://images.pexels.com/photos/10771740/pexels-photo-10771740.jpeg"], "sizes": ["S", "M", "L", "XL", "XXL"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": True, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-7", "name": "Trefoil Hoodie", "name_de": "Trefoil Kapuzenpullover", "description": "Classic Adidas Originals hoodie with trefoil logo.", "description_de": "Klassischer Adidas Originals Kapuzenpullover mit Trefoil-Logo.", "brand_id": "brand-adidas", "category_id": "cat-clothing", "images": ["https://images.pexels.com/photos/8108586/pexels-photo-8108586.jpeg"], "sizes": ["S", "M", "L", "XL"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": False, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-8", "name": "Dionysus Mini Bag", "name_de": "Dionysus Mini Tasche", "description": "Structured GG Supreme canvas bag with tiger head closure.", "description_de": "Strukturierte GG Supreme Canvas-Tasche mit Tigerkopf-Verschluss.", "brand_id": "brand-gucci", "category_id": "cat-accessories", "images": ["https://images.pexels.com/photos/11384822/pexels-photo-11384822.jpeg"], "sizes": ["One Size"], "price_text": "Price on request", "price_text_de": "Preis auf Anfrage", "featured": False, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.products.insert_many(products)
    
    reviews = [
        {"id": "rev-1", "text": "Amazing quality! The sneakers arrived perfectly packaged. Highly recommend HooHlyaShop!", "text_de": "Erstaunliche Qualität! Die Sneaker kamen perfekt verpackt an. Sehr empfehlenswert!", "author": "Marco S.", "image_url": None, "rating": 5, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "rev-2", "text": "Fast communication via WhatsApp and quick delivery. Will order again!", "text_de": "Schnelle Kommunikation über WhatsApp und schnelle Lieferung. Werde wieder bestellen!", "author": "Lisa M.", "image_url": None, "rating": 5, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "rev-3", "text": "Best place for authentic streetwear. The Stone Island jacket is perfect!", "text_de": "Bester Ort für authentische Streetwear. Die Stone Island Jacke ist perfekt!", "author": "Tim K.", "image_url": None, "rating": 5, "active": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.reviews.insert_many(reviews)
    
    return {"message": "Data seeded successfully"}

@api_router.get("/")
async def root():
    return {"message": "HooHlyaShop API"}

app.include_router(api_router)

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
