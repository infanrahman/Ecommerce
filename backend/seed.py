import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')

import django
django.setup()

from api.models import Product

products = [
    {"name": "Wireless Mouse", "description": "A smooth wireless mouse with ergonomic design.", "price": 25.99, "stock": 10},
    {"name": "Mechanical Keyboard", "description": "Clicky switches and RGB backlight.", "price": 89.99, "stock": 5},
    {"name": "USB-C Hub", "description": "7-in-1 USB-C Hub with HDMI and power delivery.", "price": 45.00, "stock": 20},
    {"name": "Laptop Stand", "description": "Aluminum laptop stand with cooling holes.", "price": 30.00, "stock": 15},
]

for p in products:
    Product.objects.get_or_create(name=p['name'], defaults=p)
print("Database seeded with sample products.")
