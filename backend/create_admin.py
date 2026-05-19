import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

user, created = User.objects.get_or_create(username='admin')
user.set_password('admin123')
user.is_superuser = True
user.is_staff = True
user.save()

print("Admin user created with username 'admin' and password 'admin123'")
