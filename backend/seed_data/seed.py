"""
Seed data script for Manufacturing ERP.
Run with: python manage.py shell < seed_data/seed.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.crm.models import Customer, Order
from apps.engineering.models import Drawing
from apps.materials.models import MaterialType, Material
from apps.fabrication.models import FabricationProcess
from apps.surface_treatment.models import TreatmentType
from apps.inspection.models import InspectionType
from apps.logistics.models import PackingStandard
from apps.accounts.models import RolePermission

User = get_user_model()


def create_users():
    """Create sample users for each role."""
    print("Creating users...")
    
    users_data = [
        {
            'email': 'admin@example.com',
            'password': 'Admin@123',
            'first_name': 'System',
            'last_name': 'Admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'email': 'sales@example.com',
            'password': 'Sales@123',
            'first_name': 'John',
            'last_name': 'Sales',
            'role': 'sales',
        },
        {
            'email': 'engineering@example.com',
            'password': 'Engg@123',
            'first_name': 'Jane',
            'last_name': 'Engineer',
            'role': 'engineering',
        },
        {
            'email': 'production@example.com',
            'password': 'Prod@123',
            'first_name': 'Mike',
            'last_name': 'Production',
            'role': 'production',
        },
        {
            'email': 'quality@example.com',
            'password': 'Quality@123',
            'first_name': 'Sarah',
            'last_name': 'QA',
            'role': 'quality',
        },
        {
            'email': 'logistics@example.com',
            'password': 'Logistics@123',
            'first_name': 'Tom',
            'last_name': 'Logistics',
            'role': 'logistics',
        },
        {
            'email': 'management@example.com',
            'password': 'Mgmt@123',
            'first_name': 'Director',
            'last_name': 'Management',
            'role': 'management',
        },
    ]
    
    for user_data in users_data:
        password = user_data.pop('password')
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults=user_data
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"  Created user: {user.email}")
        else:
            print(f"  User exists: {user.email}")
    
    return User.objects.get(email='admin@example.com')


def create_customers(admin_user):
    """Create sample customers."""
    print("Creating customers...")
    
    customers_data = [
        {
            'name': 'Rajesh Kumar',
            'company_name': 'ABC Industries Pvt Ltd',
            'customer_type': 'premium',
            'email': 'rajesh@abcindustries.com',
            'phone': '+91-9876543210',
            'address': '123, Industrial Area, Phase 1',
            'city': 'Pune',
            'state': 'Maharashtra',
            'postal_code': '411001',
            'gst_number': '27AABCU9603R1ZX',
        },
        {
            'name': 'Priya Sharma',
            'company_name': 'XYZ Manufacturing Co',
            'customer_type': 'vip',
            'email': 'priya@xyzmanufacturing.com',
            'phone': '+91-9876543211',
            'address': '456, MIDC Area',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'postal_code': '400001',
            'gst_number': '27AABCU9603R1ZY',
        },
        {
            'name': 'Amit Patel',
            'company_name': 'PQR Engineering Works',
            'customer_type': 'regular',
            'email': 'amit@pqrengineering.com',
            'phone': '+91-9876543212',
            'address': '789, Industrial Estate',
            'city': 'Ahmedabad',
            'state': 'Gujarat',
            'postal_code': '380001',
            'gst_number': '24AABCU9603R1ZZ',
        },
    ]
    
    for customer_data in customers_data:
        customer, created = Customer.objects.get_or_create(
            company_name=customer_data['company_name'],
            defaults={**customer_data, 'created_by': admin_user}
        )
        if created:
            print(f"  Created customer: {customer.company_name}")
        else:
            print(f"  Customer exists: {customer.company_name}")


def create_material_types():
    """Create material types."""
    print("Creating material types...")
    
    types = [
        ('Sheet Metal', 'Various metal sheets'),
        ('Bar Stock', 'Metal bars and rods'),
        ('Pipe/Tube', 'Pipes and tubes'),
        ('Fasteners', 'Nuts, bolts, screws'),
        ('Consumables', 'Welding consumables, etc.'),
    ]
    
    for name, desc in types:
        obj, created = MaterialType.objects.get_or_create(
            name=name,
            defaults={'description': desc}
        )
        if created:
            print(f"  Created material type: {name}")


def create_materials():
    """Create sample materials."""
    print("Creating materials...")
    
    sheet_metal = MaterialType.objects.get(name='Sheet Metal')
    
    materials_data = [
        {
            'material_type': sheet_metal,
            'code': 'MS-2MM',
            'name': 'Mild Steel Sheet 2mm',
            'grade': 'IS 2062',
            'thickness': 2.0,
            'unit': 'kg',
            'unit_price': 75.00,
            'stock_quantity': 500,
            'minimum_stock': 100,
        },
        {
            'material_type': sheet_metal,
            'code': 'SS-304-1.5MM',
            'name': 'Stainless Steel 304 Sheet 1.5mm',
            'grade': 'SS 304',
            'thickness': 1.5,
            'unit': 'kg',
            'unit_price': 250.00,
            'stock_quantity': 200,
            'minimum_stock': 50,
        },
        {
            'material_type': sheet_metal,
            'code': 'AL-3MM',
            'name': 'Aluminum Sheet 3mm',
            'grade': 'AL 6061',
            'thickness': 3.0,
            'unit': 'kg',
            'unit_price': 180.00,
            'stock_quantity': 150,
            'minimum_stock': 30,
        },
    ]
    
    for mat_data in materials_data:
        mat, created = Material.objects.get_or_create(
            code=mat_data['code'],
            defaults=mat_data
        )
        if created:
            print(f"  Created material: {mat.code}")


def create_fabrication_processes():
    """Create fabrication processes."""
    print("Creating fabrication processes...")
    
    processes = [
        ('LC2D', '2D Laser Cutting', 'cutting', 1),
        ('LC3D', '3D Laser Cutting', 'cutting', 2),
        ('SHEAR', 'Shearing', 'cutting', 3),
        ('BEND', 'Bending', 'forming', 4),
        ('STAMP', 'Stamping', 'forming', 5),
        ('WELD', 'Welding', 'joining', 6),
        ('GRIND', 'Grinding', 'finishing', 7),
        ('BUFF', 'Buffing', 'finishing', 8),
        ('ASSY', 'Assembly', 'assembly', 9),
    ]
    
    for code, name, category, seq in processes:
        obj, created = FabricationProcess.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'category': category,
                'sequence_order': seq
            }
        )
        if created:
            print(f"  Created process: {name}")


def create_treatment_types():
    """Create surface treatment types."""
    print("Creating treatment types...")
    
    treatments = [
        ('PC', 'Powder Coating'),
        ('ED', 'ED Coating'),
        ('GALV', 'Galvanization'),
        ('ANOD', 'Anodizing'),
        ('PAINT', 'Painting'),
    ]
    
    for code, name in treatments:
        obj, created = TreatmentType.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
        if created:
            print(f"  Created treatment type: {name}")


def create_inspection_types():
    """Create inspection types."""
    print("Creating inspection types...")
    
    inspections = [
        ('INC', 'Incoming Inspection', 'incoming', True),
        ('LINE', 'Line Inspection', 'in_process', True),
        ('FINAL', 'Final Inspection', 'final', True),
        ('PDI', 'Pre-Dispatch Inspection', 'pdi', True),
    ]
    
    for code, name, stage, mandatory in inspections:
        obj, created = InspectionType.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'stage': stage,
                'is_mandatory': mandatory
            }
        )
        if created:
            print(f"  Created inspection type: {name}")


def create_packing_standards():
    """Create packing standards."""
    print("Creating packing standards...")
    
    standards = [
        ('STD', 'Standard Packing', 'Standard carton box packing'),
        ('WOOD', 'Wooden Crate', 'Wooden crate for heavy items'),
        ('PLT', 'Pallet Packing', 'Pallet with stretch wrap'),
        ('EXP', 'Export Packing', 'Sea-worthy export packing'),
    ]
    
    for code, name, desc in standards:
        obj, created = PackingStandard.objects.get_or_create(
            code=code,
            defaults={'name': name, 'description': desc}
        )
        if created:
            print(f"  Created packing standard: {name}")


def create_role_permissions():
    """Create default role permissions."""
    print("Creating role permissions...")
    
    modules = [
        'crm', 'engineering', 'materials', 'production',
        'fabrication', 'surface_treatment', 'inspection',
        'logistics', 'dashboards', 'audit'
    ]
    
    # Define access levels for each role
    role_access = {
        'admin': {module: 'full' for module in modules},
        'sales': {
            'crm': 'full', 'engineering': 'read', 'materials': 'read',
            'production': 'read', 'fabrication': 'read', 'surface_treatment': 'read',
            'inspection': 'read', 'logistics': 'read', 'dashboards': 'read', 'audit': 'none'
        },
        'engineering': {
            'crm': 'read', 'engineering': 'full', 'materials': 'read',
            'production': 'read', 'fabrication': 'read', 'surface_treatment': 'read',
            'inspection': 'read', 'logistics': 'read', 'dashboards': 'read', 'audit': 'none'
        },
        'production': {
            'crm': 'read', 'engineering': 'read', 'materials': 'write',
            'production': 'full', 'fabrication': 'full', 'surface_treatment': 'full',
            'inspection': 'read', 'logistics': 'read', 'dashboards': 'read', 'audit': 'none'
        },
        'quality': {
            'crm': 'read', 'engineering': 'read', 'materials': 'read',
            'production': 'read', 'fabrication': 'read', 'surface_treatment': 'read',
            'inspection': 'full', 'logistics': 'read', 'dashboards': 'read', 'audit': 'none'
        },
        'logistics': {
            'crm': 'read', 'engineering': 'read', 'materials': 'read',
            'production': 'read', 'fabrication': 'read', 'surface_treatment': 'read',
            'inspection': 'read', 'logistics': 'full', 'dashboards': 'read', 'audit': 'none'
        },
        'management': {
            'crm': 'read', 'engineering': 'read', 'materials': 'read',
            'production': 'read', 'fabrication': 'read', 'surface_treatment': 'read',
            'inspection': 'read', 'logistics': 'read', 'dashboards': 'read', 'audit': 'read'
        },
    }
    
    for role, permissions in role_access.items():
        for module, access in permissions.items():
            obj, created = RolePermission.objects.update_or_create(
                role=role,
                module=module,
                defaults={'access_level': access}
            )
    
    print("  Role permissions configured")


def create_sample_orders(admin_user):
    """Create sample orders."""
    print("Creating sample orders...")
    
    customer = Customer.objects.first()
    if not customer:
        print("  No customers found, skipping orders")
        return
    
    from datetime import date, timedelta
    
    orders_data = [
        {
            'quote_number': 'QT-2024-001',
            'po_number': 'PO-2024-001',
            'work_order_number': 'WO-2024-001',
            'customer': customer,
            'project_name': 'Machine Frame Assembly',
            'ordered_quantity': 50,
            'planned_lead_time': 30,
            'expected_delivery_date': date.today() + timedelta(days=30),
            'status': 'in_production',
            'status_percentage': 45,
            'priority': 'high',
            'unit_price': 5000.00,
        },
        {
            'quote_number': 'QT-2024-002',
            'po_number': 'PO-2024-002',
            'customer': customer,
            'project_name': 'Control Panel Enclosure',
            'ordered_quantity': 100,
            'planned_lead_time': 21,
            'expected_delivery_date': date.today() + timedelta(days=21),
            'status': 'confirmed',
            'status_percentage': 10,
            'priority': 'normal',
            'unit_price': 2500.00,
        },
    ]
    
    for order_data in orders_data:
        order, created = Order.objects.get_or_create(
            quote_number=order_data['quote_number'],
            defaults={**order_data, 'created_by': admin_user}
        )
        if created:
            print(f"  Created order: {order.quote_number}")


def run_seed():
    """Run all seed functions."""
    print("\n=== Starting Seed Data Creation ===\n")
    
    admin_user = create_users()
    create_customers(admin_user)
    create_material_types()
    create_materials()
    create_fabrication_processes()
    create_treatment_types()
    create_inspection_types()
    create_packing_standards()
    create_role_permissions()
    create_sample_orders(admin_user)
    
    print("\n=== Seed Data Creation Complete ===\n")
    print("Default login credentials:")
    print("  Admin: admin@example.com / Admin@123")
    print("  Sales: sales@example.com / Sales@123")
    print("  Engineering: engineering@example.com / Engg@123")
    print("  Production: production@example.com / Prod@123")
    print("  Quality: quality@example.com / Quality@123")
    print("  Logistics: logistics@example.com / Logistics@123")
    print("  Management: management@example.com / Mgmt@123")


if __name__ == '__main__':
    run_seed()

    #run command
    # Run seed data script
    # python manage.py shell
    # In the shell, type:
    # exec(open('../seed_data/seed.py').read())
    # Then type:
    # exit()