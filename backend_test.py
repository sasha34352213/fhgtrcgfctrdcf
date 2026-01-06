#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class HooHlyaShopAPITester:
    def __init__(self, base_url="https://fashionpdf.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_seed_data(self):
        """Test seeding initial data"""
        try:
            response = self.session.post(f"{self.base_url}/seed")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("Seed Data", success, details)
            return success
        except Exception as e:
            self.log_test("Seed Data", False, str(e))
            return False

    def test_brands_endpoints(self):
        """Test all brand-related endpoints"""
        # Get all brands
        try:
            response = self.session.get(f"{self.base_url}/brands")
            success = response.status_code == 200
            brands = response.json() if success else []
            self.log_test("Get Brands", success, f"Status: {response.status_code}, Count: {len(brands)}")
            
            if success and brands:
                # Test get single brand
                brand_id = brands[0]['id']
                response = self.session.get(f"{self.base_url}/brands/{brand_id}")
                success = response.status_code == 200
                self.log_test("Get Single Brand", success, f"Status: {response.status_code}")
                
                # Test create brand
                new_brand = {
                    "name": "Test Brand",
                    "name_de": "Test Marke",
                    "logo_url": "https://example.com/logo.png"
                }
                response = self.session.post(f"{self.base_url}/brands", json=new_brand)
                success = response.status_code == 200
                created_brand = response.json() if success else {}
                self.log_test("Create Brand", success, f"Status: {response.status_code}")
                
                if success and created_brand:
                    # Test update brand
                    update_data = {"name": "Updated Test Brand", "name_de": "Aktualisierte Test Marke"}
                    response = self.session.put(f"{self.base_url}/brands/{created_brand['id']}", json=update_data)
                    success = response.status_code == 200
                    self.log_test("Update Brand", success, f"Status: {response.status_code}")
                    
                    # Test delete brand
                    response = self.session.delete(f"{self.base_url}/brands/{created_brand['id']}")
                    success = response.status_code == 200
                    self.log_test("Delete Brand", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Brands Endpoints", False, str(e))

    def test_categories_endpoints(self):
        """Test all category-related endpoints"""
        try:
            response = self.session.get(f"{self.base_url}/categories")
            success = response.status_code == 200
            categories = response.json() if success else []
            self.log_test("Get Categories", success, f"Status: {response.status_code}, Count: {len(categories)}")
            
            if success and categories:
                # Test get single category
                cat_id = categories[0]['id']
                response = self.session.get(f"{self.base_url}/categories/{cat_id}")
                success = response.status_code == 200
                self.log_test("Get Single Category", success, f"Status: {response.status_code}")
                
                # Test create category
                new_category = {
                    "name": "Test Category",
                    "name_de": "Test Kategorie",
                    "slug": "test-category"
                }
                response = self.session.post(f"{self.base_url}/categories", json=new_category)
                success = response.status_code == 200
                created_cat = response.json() if success else {}
                self.log_test("Create Category", success, f"Status: {response.status_code}")
                
                if success and created_cat:
                    # Test update category
                    update_data = {"name": "Updated Test Category", "name_de": "Aktualisierte Test Kategorie", "slug": "updated-test-category"}
                    response = self.session.put(f"{self.base_url}/categories/{created_cat['id']}", json=update_data)
                    success = response.status_code == 200
                    self.log_test("Update Category", success, f"Status: {response.status_code}")
                    
                    # Test delete category
                    response = self.session.delete(f"{self.base_url}/categories/{created_cat['id']}")
                    success = response.status_code == 200
                    self.log_test("Delete Category", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Categories Endpoints", False, str(e))

    def test_products_endpoints(self):
        """Test all product-related endpoints"""
        try:
            # Get all products
            response = self.session.get(f"{self.base_url}/products")
            success = response.status_code == 200
            products = response.json() if success else []
            self.log_test("Get Products", success, f"Status: {response.status_code}, Count: {len(products)}")
            
            # Get all products (admin endpoint)
            response = self.session.get(f"{self.base_url}/products/all")
            success = response.status_code == 200
            all_products = response.json() if success else []
            self.log_test("Get All Products", success, f"Status: {response.status_code}, Count: {len(all_products)}")
            
            # Test featured products
            response = self.session.get(f"{self.base_url}/products?featured=true")
            success = response.status_code == 200
            featured = response.json() if success else []
            self.log_test("Get Featured Products", success, f"Status: {response.status_code}, Count: {len(featured)}")
            
            # Test search
            response = self.session.get(f"{self.base_url}/products?search=nike")
            success = response.status_code == 200
            search_results = response.json() if success else []
            self.log_test("Search Products", success, f"Status: {response.status_code}, Count: {len(search_results)}")
            
            if products:
                # Test get single product
                product_id = products[0]['id']
                response = self.session.get(f"{self.base_url}/products/{product_id}")
                success = response.status_code == 200
                self.log_test("Get Single Product", success, f"Status: {response.status_code}")
                
                # Get brands and categories for creating product
                brands_resp = self.session.get(f"{self.base_url}/brands")
                categories_resp = self.session.get(f"{self.base_url}/categories")
                
                if brands_resp.status_code == 200 and categories_resp.status_code == 200:
                    brands = brands_resp.json()
                    categories = categories_resp.json()
                    
                    if brands and categories:
                        # Test create product
                        new_product = {
                            "name": "Test Product",
                            "name_de": "Test Produkt",
                            "description": "Test description",
                            "description_de": "Test Beschreibung",
                            "brand_id": brands[0]['id'],
                            "category_id": categories[0]['id'],
                            "images": ["https://example.com/image.jpg"],
                            "sizes": ["S", "M", "L"],
                            "price_text": "Test Price",
                            "price_text_de": "Test Preis",
                            "featured": False,
                            "active": True
                        }
                        response = self.session.post(f"{self.base_url}/products", json=new_product)
                        success = response.status_code == 200
                        created_product = response.json() if success else {}
                        self.log_test("Create Product", success, f"Status: {response.status_code}")
                        
                        if success and created_product:
                            # Test update product
                            update_data = {"name": "Updated Test Product", "featured": True}
                            response = self.session.put(f"{self.base_url}/products/{created_product['id']}", json=update_data)
                            success = response.status_code == 200
                            self.log_test("Update Product", success, f"Status: {response.status_code}")
                            
                            # Test delete product
                            response = self.session.delete(f"{self.base_url}/products/{created_product['id']}")
                            success = response.status_code == 200
                            self.log_test("Delete Product", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Products Endpoints", False, str(e))

    def test_reviews_endpoints(self):
        """Test all review-related endpoints"""
        try:
            # Get active reviews
            response = self.session.get(f"{self.base_url}/reviews")
            success = response.status_code == 200
            reviews = response.json() if success else []
            self.log_test("Get Reviews", success, f"Status: {response.status_code}, Count: {len(reviews)}")
            
            # Get all reviews
            response = self.session.get(f"{self.base_url}/reviews/all")
            success = response.status_code == 200
            all_reviews = response.json() if success else []
            self.log_test("Get All Reviews", success, f"Status: {response.status_code}, Count: {len(all_reviews)}")
            
            # Test create review
            new_review = {
                "text": "Test review text",
                "text_de": "Test Bewertungstext",
                "author": "Test User",
                "rating": 5,
                "active": True
            }
            response = self.session.post(f"{self.base_url}/reviews", json=new_review)
            success = response.status_code == 200
            created_review = response.json() if success else {}
            self.log_test("Create Review", success, f"Status: {response.status_code}")
            
            if success and created_review:
                # Test update review
                update_data = {"text": "Updated test review", "rating": 4}
                response = self.session.put(f"{self.base_url}/reviews/{created_review['id']}", json=update_data)
                success = response.status_code == 200
                self.log_test("Update Review", success, f"Status: {response.status_code}")
                
                # Test delete review
                response = self.session.delete(f"{self.base_url}/reviews/{created_review['id']}")
                success = response.status_code == 200
                self.log_test("Delete Review", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Reviews Endpoints", False, str(e))

    def test_admin_login(self):
        """Test admin login"""
        try:
            # Test correct password
            response = self.session.post(f"{self.base_url}/admin/login", json={"password": "hoohlyaadmin2024"})
            success = response.status_code == 200
            self.log_test("Admin Login (Correct)", success, f"Status: {response.status_code}")
            
            # Test incorrect password
            response = self.session.post(f"{self.base_url}/admin/login", json={"password": "wrongpassword"})
            success = response.status_code == 401
            self.log_test("Admin Login (Incorrect)", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Admin Login", False, str(e))

    def test_orders_and_pdf(self):
        """Test order creation and PDF generation"""
        try:
            # Create test order
            order_data = {
                "items": [
                    {
                        "product_id": "test-product-1",
                        "product_name": "Test Product",
                        "brand_name": "Test Brand",
                        "quantity": 2,
                        "size": "M",
                        "image_url": "https://example.com/image.jpg"
                    }
                ],
                "customer_name": "Test Customer",
                "customer_contact": "test@example.com",
                "comment": "Test order comment",
                "language": "en"
            }
            
            response = self.session.post(f"{self.base_url}/orders", json=order_data)
            success = response.status_code == 200
            order_result = response.json() if success else {}
            self.log_test("Create Order", success, f"Status: {response.status_code}")
            
            if success and order_result.get('order_id'):
                # Test PDF generation
                pdf_response = self.session.get(f"{self.base_url}/orders/{order_result['order_id']}/pdf")
                pdf_success = pdf_response.status_code == 200 and pdf_response.headers.get('content-type') == 'application/pdf'
                self.log_test("Generate PDF", pdf_success, f"Status: {pdf_response.status_code}, Content-Type: {pdf_response.headers.get('content-type', 'N/A')}")
            
        except Exception as e:
            self.log_test("Orders and PDF", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting HooHlyaShop API Tests...")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Seed data first
        self.test_seed_data()
        
        # Test all endpoints
        self.test_brands_endpoints()
        self.test_categories_endpoints()
        self.test_products_endpoints()
        self.test_reviews_endpoints()
        self.test_admin_login()
        self.test_orders_and_pdf()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {len(self.failed_tests)}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"   - {failed['test']}: {failed['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = HooHlyaShopAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())