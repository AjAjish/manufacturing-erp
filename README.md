<div align="center">
  <h1>🏭 Manufacturing ERP System</h1>
  <p>A comprehensive Enterprise Resource Planning solution for manufacturing companies</p>
  
  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
  ![License](https://img.shields.io/badge/license-MIT-green.svg)
  ![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg)
  ![Django](https://img.shields.io/badge/Django-4.2-green.svg)
  ![React](https://img.shields.io/badge/React-18.2-blue.svg)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)
  
  <img src="docs/images/dashboard-preview.png" alt="Dashboard Preview" width="800">
</div>

---

## 🌟 Overview

Manufacturing ERP is a full-featured enterprise resource planning system designed specifically for manufacturing companies. It provides end-to-end order tracking, from quote generation to final delivery, with comprehensive modules for engineering, production, quality control, and logistics.

### Key Highlights

- 📦 **Complete Order Lifecycle Management** - Track orders from quote to delivery
- 👥 **Role-Based Access Control** - 7 predefined roles with granular permissions
- 📊 **Real-Time Dashboards** - KPIs, analytics, and performance metrics
- 🔄 **Workflow Automation** - Automated status updates and notifications
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **Secure** - JWT authentication with role-based permissions

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Dashboard│ │ Orders  │ │Materials│ │Production│ │Logistics│   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       └──────────┬┴──────────┬┴──────────┬┴──────────┬┘         │
│                  │    React Router + Context API    │           │
│                  └──────────────┬───────────────────┘           │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ REST API (JSON)
                                  │ JWT Authentication
┌─────────────────────────────────┼───────────────────────────────┐
│                      BACKEND (Django REST Framework)             │
│  ┌──────────────────────────────┴────────────────────────────┐  │
│  │                     API Gateway (urls.py)                  │  │
│  └──────────────────────────────┬────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────┴─────┐ ┌──────────┐           │
│  │ Accounts │ │   CRM    │ │Engineering│ │ Materials│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Production│ │Fabrication│ │Inspection│ │ Logistics│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐                                      │
│  │Dashboards│ │  Audit   │                                      │
│  └──────────┘ └──────────┘                                      │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────┐
│                         DATABASE (MySQL)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Users  │ │ Orders  │ │Customers│ │Materials│ │Drawings │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 📋 Order Management
- Create and manage quotes, purchase orders, and work orders
- Track order status through the entire manufacturing process
- Priority management (Low, Normal, High, Urgent)
- Automatic lead time calculation
- Order history and audit trail

### 👥 Customer Management
- Complete customer database with contact information
- Customer categorization (Regular, Premium, VIP)
- Order history per customer
- GST/Tax information management

### 📐 Engineering
- Drawing upload and version control
- Support for multiple formats (PDF, DWG, DXF, STEP, IGS)
- Drawing approval workflow
- Revision tracking

### 📦 Materials Management
- Material master data with specifications
- Inventory tracking with low stock alerts
- Material requirement planning per order
- Issue and return tracking
- Transaction history

### �icing Production Tracking
- Daily production recording by shift
- OK/Rework/Rejection quantity tracking
- Automatic yield calculation
- Production summary per order

### ⚙️ Fabrication Process Tracking
- Configurable fabrication processes:
  - 2D/3D Laser Cutting
  - Shearing
  - Bending
  - Stamping
  - Welding
  - Grinding
  - Buffing
  - Assembly
- Process-wise status tracking
- Sequence management

### 🎨 Surface Treatment
- Powder coating tracking
- ED coating management
- Outsourced treatment support
- Vendor management

### ✅ Quality Inspection
- Multiple inspection stages:
  - Incoming Inspection
  - In-Process Inspection
  - Final Inspection
  - Pre-Dispatch Inspection (PDI)
- QA approval workflow
- **Dispatch blocking until QA approval**
- Checklist management

### 🚚 Logistics & Dispatch
- Packing management
- Multiple transport modes support
- Dispatch documentation
- Delivery tracking
- E-way bill and LR number tracking

### 📊 Dashboards & Analytics
- Real-time KPI dashboard
- Order status distribution
- Production yield analysis
- Delayed orders tracking
- Department-wise performance
- Customer-wise summary
- Monthly trends

### 🔐 Security & Access Control
- JWT-based authentication
- Role-based access control (RBAC)
- Module-level permissions
- Audit trail for all actions

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming Language |
| Django | 4.2 | Web Framework |
| Django REST Framework | 3.14 | REST API |
| Simple JWT | 5.3 | Authentication |
| MySQL | 8.0 | Database |
| django-cors-headers | 4.3 | CORS Support |
| django-filter | 23.5 | API Filtering |
| drf-yasg | 1.21 | API Documentation |
| Pillow | 10.2 | Image Processing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| Vite | 5.0 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| React Router DOM | 6.21 | Routing |
| React Hook Form | 7.49 | Form Management |
| Axios | 1.6 | HTTP Client |
| Recharts | 2.10 | Charts |
| Headless UI | 1.7 | UI Components |
| Hero Icons | 2.1 | Icons |
| react-hot-toast | 2.4 | Notifications |

---

## 📥 Installation Guide

### Prerequisites

Ensure you have the following installed:

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **MySQL** 8.0 or higher
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/manufacturing-erp.git
cd manufacturing-erp
```

### Step 2: Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE manufacturing_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional but recommended)
CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON manufacturing_erp.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see Configuration section)

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data (optional but recommended for testing)
python manage.py shell < ../seed_data/seed.py

# Collect static files (for production)
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver
```

### Step 4: Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1/
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin/

---

## ⚙️ Configuration

### Backend Configuration (.env)

Create a `.env` file in the `backend` directory:

```env
# Django Settings
SECRET_KEY=your-very-secure-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=manufacturing_erp
DB_USER=root
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Settings (optional - defaults are set in settings.py)
# ACCESS_TOKEN_LIFETIME=60  # minutes
# REFRESH_TOKEN_LIFETIME=7  # days
```

### Frontend Configuration (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Environment Files Templates

```bash name=backend/.env.example
# Django Settings
SECRET_KEY=change-this-to-a-secure-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=manufacturing_erp
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

```bash name=frontend/.env.example
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 👥 User Roles & Permissions

### Default Users (After Seed Data)

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@example.com | Admin@123 | Full access to all modules |
| Sales | sales@example.com | Sales@123 | CRM, read-only on others |
| Engineering | engineering@example.com | Engg@123 | Engineering, drawings |
| Production | production@example.com | Prod@123 | Production, fabrication, materials |
| Quality | quality@example.com | Quality@123 | Inspection, QA approval |
| Logistics | logistics@example.com | Logistics@123 | Dispatch, packing |
| Management | management@example.com | Mgmt@123 | Read-only dashboards |

### Permission Matrix

| Module | Admin | Sales | Engineering | Production | Quality | Logistics | Management |
|--------|-------|-------|-------------|------------|---------|-----------|------------|
| CRM | Full | Full | Read | Read | Read | Read | Read |
| Engineering | Full | Read | Full | Read | Read | Read | Read |
| Materials | Full | Read | Read | Write | Read | Read | Read |
| Production | Full | Read | Read | Full | Read | Read | Read |
| Fabrication | Full | Read | Read | Full | Read | Read | Read |
| Surface Treatment | Full | Read | Read | Full | Read | Read | Read |
| Inspection | Full | Read | Read | Read | Full | Read | Read |
| Logistics | Full | Read | Read | Read | Read | Full | Read |
| Dashboards | Full | Read | Read | Read | Read | Read | Read |
| Audit | Full | None | None | None | None | None | Read |
| Users | Full | None | None | None | None | None | None |

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/accounts/login/           # Login and get tokens
POST   /api/v1/accounts/token/refresh/   # Refresh access token
POST   /api/v1/accounts/logout/          # Logout (blacklist token)
```

### User Endpoints

```
GET    /api/v1/accounts/users/           # List users (Admin)
POST   /api/v1/accounts/users/           # Create user (Admin)
GET    /api/v1/accounts/users/{id}/      # Get user details
PATCH  /api/v1/accounts/users/{id}/      # Update user
GET    /api/v1/accounts/users/me/        # Get current user
PUT    /api/v1/accounts/users/update_profile/  # Update profile
POST   /api/v1/accounts/users/change_password/ # Change password
```

### CRM Endpoints

```
# Customers
GET    /api/v1/crm/customers/            # List customers
POST   /api/v1/crm/customers/            # Create customer
GET    /api/v1/crm/customers/{id}/       # Get customer
PATCH  /api/v1/crm/customers/{id}/       # Update customer
DELETE /api/v1/crm/customers/{id}/       # Delete customer
GET    /api/v1/crm/customers/{id}/orders/ # Get customer orders

# Orders
GET    /api/v1/crm/orders/               # List orders
POST   /api/v1/crm/orders/               # Create order
GET    /api/v1/crm/orders/{id}/          # Get order
PATCH  /api/v1/crm/orders/{id}/          # Update order
DELETE /api/v1/crm/orders/{id}/          # Delete order
POST   /api/v1/crm/orders/{id}/update_status/  # Update status
GET    /api/v1/crm/orders/{id}/status_history/ # Status history
GET    /api/v1/crm/orders/delayed/       # Get delayed orders
GET    /api/v1/crm/orders/by_status/     # Orders by status
```

### Engineering Endpoints

```
GET    /api/v1/engineering/drawings/              # List drawings
POST   /api/v1/engineering/drawings/              # Upload drawing
GET    /api/v1/engineering/drawings/{id}/         # Get drawing
PATCH  /api/v1/engineering/drawings/{id}/         # Update drawing
POST   /api/v1/engineering/drawings/{id}/new_version/  # New version
POST   /api/v1/engineering/drawings/{id}/approve/      # Approve
POST   /api/v1/engineering/drawings/{id}/reject/       # Reject
GET    /api/v1/engineering/drawings/{id}/versions/     # Get versions
GET    /api/v1/engineering/drawings/by_order/          # By order
```

### Materials Endpoints

```
# Material Types
GET    /api/v1/materials/types/          # List types
POST   /api/v1/materials/types/          # Create type

# Materials
GET    /api/v1/materials/materials/      # List materials
POST   /api/v1/materials/materials/      # Create material
GET    /api/v1/materials/materials/{id}/ # Get material
PATCH  /api/v1/materials/materials/{id}/ # Update material
GET    /api/v1/materials/materials/low_stock/  # Low stock items
POST   /api/v1/materials/materials/{id}/adjust_stock/ # Adjust stock

# Order Materials
GET    /api/v1/materials/order-materials/        # List
POST   /api/v1/materials/order-materials/        # Create
POST   /api/v1/materials/order-materials/{id}/issue/ # Issue material
GET    /api/v1/materials/order-materials/by_order/   # By order
```

### Production Endpoints

```
GET    /api/v1/production/records/               # List records
POST   /api/v1/production/records/               # Create record
GET    /api/v1/production/records/{id}/          # Get record
PATCH  /api/v1/production/records/{id}/          # Update record
POST   /api/v1/production/records/{id}/verify/   # Verify record
GET    /api/v1/production/records/by_order/      # By order
GET    /api/v1/production/records/daily_summary/ # Daily summary
GET    /api/v1/production/records/yield_analysis/ # Yield analysis
GET    /api/v1/production/summaries/             # Production summaries
```

### Fabrication Endpoints

```
# Processes
GET    /api/v1/fabrication/processes/    # List processes

# Order Fabrications
GET    /api/v1/fabrication/order-fabrications/           # List
POST   /api/v1/fabrication/order-fabrications/           # Create
POST   /api/v1/fabrication/order-fabrications/{id}/start/    # Start
POST   /api/v1/fabrication/order-fabrications/{id}/complete/ # Complete
POST   /api/v1/fabrication/order-fabrications/{id}/hold/     # Hold
POST   /api/v1/fabrication/order-fabrications/bulk_create/   # Bulk create
GET    /api/v1/fabrication/order-fabrications/by_order/      # By order
GET    /api/v1/fabrication/order-fabrications/in_progress/   # In progress
```

### Inspection Endpoints

```
GET    /api/v1/inspection/types/                     # List types
GET    /api/v1/inspection/order-inspections/         # List inspections
POST   /api/v1/inspection/order-inspections/         # Create
GET    /api/v1/inspection/order-inspections/{id}/    # Get inspection
PATCH  /api/v1/inspection/order-inspections/{id}/    # Update
POST   /api/v1/inspection/order-inspections/{id}/qa_approve/ # QA approve
GET    /api/v1/inspection/order-inspections/pending_approval/ # Pending
GET    /api/v1/inspection/order-inspections/dispatch_blocked/ # Blocked
```

### Logistics Endpoints

```
GET    /api/v1/logistics/packing-standards/          # List standards
GET    /api/v1/logistics/dispatches/                 # List dispatches
POST   /api/v1/logistics/dispatches/                 # Create
GET    /api/v1/logistics/dispatches/{id}/            # Get dispatch
PATCH  /api/v1/logistics/dispatches/{id}/            # Update
POST   /api/v1/logistics/dispatches/{id}/start_packing/   # Start packing
POST   /api/v1/logistics/dispatches/{id}/mark_packed/     # Mark packed
POST   /api/v1/logistics/dispatches/{id}/dispatch/        # Dispatch
POST   /api/v1/logistics/dispatches/{id}/mark_delivered/  # Delivered
GET    /api/v1/logistics/dispatches/pending_dispatch/     # Pending
GET    /api/v1/logistics/dispatches/in_transit/           # In transit
```

### Dashboard Endpoints

```
GET    /api/v1/dashboards/overview/              # Dashboard overview
GET    /api/v1/dashboards/order-tracking/        # Order tracking
GET    /api/v1/dashboards/delayed-orders/        # Delayed orders
GET    /api/v1/dashboards/production-analytics/  # Production analytics
GET    /api/v1/dashboards/department-performance/ # Dept performance
GET    /api/v1/dashboards/customer-summary/      # Customer summary
GET    /api/v1/dashboards/monthly-trends/        # Monthly trends
GET    /api/v1/dashboards/real-time-status/      # Real-time status
```

### Audit Endpoints

```
GET    /api/v1/audit/logs/                       # List audit logs
GET    /api/v1/audit/logs/{id}/                  # Get log detail
GET    /api/v1/audit/logs/by_user/               # Logs by user
GET    /api/v1/audit/logs/by_model/              # Logs by model
GET    /api/v1/audit/logs/by_object/             # Logs by object
GET    /api/v1/audit/logs/statistics/            # Statistics
GET    /api/v1/audit/activities/                 # User activities
```

---

## 📖 User Guide

### Order Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Draft   │───▶│  Quoted  │───▶│ Confirmed│───▶│   In     │
│          │    │          │    │          │    │Production│
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
┌──────────┐    ┌──────────┐    ┌──────────┐         │
│Completed │◀───│Dispatched│◀───│Ready for │◀───┬────┘
│          │    │          │    │ Dispatch │    │
└──────────┘    └──────────┘    └──────────┘    │
                                                 │
                                          ┌──────┴─────┐
                                          │  Quality   │
                                          │   Check    │
                                          └────────────┘
```

### Step-by-Step Process

1. **Sales Creates Order**
   - Login as Sales user
   - Create customer (if new)
   - Create order with quote number
   - Set priority and expected delivery date

2. **Engineering Uploads Drawings**
   - Login as Engineering user
   - Navigate to order detail
   - Upload drawings in Engineering tab
   - Submit for review/approval

3. **Materials Planning**
   - Add required materials to order
   - Check stock availability
   - Issue materials for production

4. **Production Records**
   - Login as Production user
   - Record daily production quantities
   - Enter OK, Rework, Rejection quantities
   - System auto-calculates yield

5. **Fabrication Tracking**
   - Track each fabrication process
   - Start/Complete each process
   - Monitor completion percentage

6. **Quality Inspection**
   - Login as Quality user
   - Perform inspections at each stage
   - Record Pass/Fail results
   - **QA Approval required for dispatch**

7. **Dispatch**
   - Login as Logistics user
   - Start packing process
   - Enter dispatch details
   - Mark as dispatched
   - Track delivery

8. **Management Dashboard**
   - Login as Management user
   - View real-time KPIs
   - Monitor delayed orders
   - Analyze production yield

---

## 💻 Development Guide

### Project Structure

```
manufacturing-erp/
├── backend/
│   ├── config/                 # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py        # Main settings
│   │   ├── urls.py            # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── __init__.py
│   │   ├── accounts/          # User authentication & roles
│   │   │   ├── models.py      # User, RolePermission
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── permissions.py # Custom permissions
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── crm/               # Customers & Orders
│   │   │   ├── models.py      # Customer, Order, OrderStatusHistory
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── engineering/       # Drawings management
│   │   │   ├── models.py      # Drawing, DrawingComment
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── materials/         # Inventory management
│   │   │   ├── models.py      # MaterialType, Material, OrderMaterial
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── production/        # Production tracking
│   │   │   ├── models.py      # ProductionRecord, ProductionSummary
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── fabrication/       # Process tracking
│   │   │   ├── models.py      # FabricationProcess, OrderFabrication
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── surface_treatment/ # Coating processes
│   │   │   ├── models.py      # TreatmentType, OrderSurfaceTreatment
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── inspection/        # Quality control
│   │   │   ├── models.py      # InspectionType, OrderInspection
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── logistics/         # Dispatch management
│   │   │   ├── models.py      # PackingStandard, OrderDispatch
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── dashboards/        # Analytics & KPIs
│   │   │   ├── views.py       # Dashboard API views
│   │   │   └── urls.py
│   │   └── audit/             # Activity logging
│   │       ├── models.py      # AuditLog, UserActivity
│   │       ├── middleware.py
│   │       ├── signals.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── admin.py
│   ├── media/                 # Uploaded files
│   ├── staticfiles/           # Collected static files
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable components
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   └── Tabs.jsx
│   │   │   ├── forms/         # Form components
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── FormSelect.jsx
│   │   │   │   └── FormTextarea.jsx
│   │   │   └── layouts/       # Layout components
│   │   │       └── DashboardLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   └── usePagination.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── orders/
│   │   │   │   ├── OrdersList.jsx
│   │   │   │   ├── OrderDetail.jsx
│   │   │   │   ├── OrderCreate.jsx
│   │   │   │   └── tabs/
│   │   │   │       ├── OrderCRMTab.jsx
│   │   │   │       ├── OrderEngineeringTab.jsx
│   │   │   │       ├── OrderMaterialsTab.jsx
│   │   │   │       ├── OrderProductionTab.jsx
│   │   │   │       ├── OrderFabricationTab.jsx
│   │   │   │       ├── OrderInspectionTab.jsx
│   │   │   │       └── OrderLogisticsTab.jsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomersList.jsx
│   │   │   │   └── CustomerDetail.jsx
│   │   │   ├── materials/
│   │   │   │   └── MaterialsList.jsx
│   │   │   ├── production/
│   │   │   │   └── ProductionRecords.jsx
│   │   │   ├── inspection/
│   │   │   │   └── InspectionList.jsx
│   │   │   ├── logistics/
│   │   │   │   └── DispatchList.jsx
│   │   │   ├── users/
│   │   │   │   └── UsersList.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
│
├── seed_data/
│   └── seed.py                # Sample data script
│
├── docs/
│   ├── images/
│   ├── API.md
│   └── DEVELOPMENT.md
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

### Adding a New Module

1. **Create Django App**
```bash
cd backend
python manage.py startapp new_module
mv new_module apps/
```

2. **Register in settings.py**
```python
INSTALLED_APPS = [
    # ...
    'apps.new_module',
]
```

3. **Create Models**
```python
# apps/new_module/models.py
from django.db import models
import uuid

class NewModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # ... fields
```

4. **Create Serializers**
```python
# apps/new_module/serializers.py
from rest_framework import serializers
from .models import NewModel

class NewModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = '__all__'
```

5. **Create Views**
```python
# apps/new_module/views.py
from rest_framework import viewsets
from .models import NewModel
from .serializers import NewModelSerializer

class NewModelViewSet(viewsets.ModelViewSet):
    queryset = NewModel.objects.all()
    serializer_class = NewModelSerializer
```

6. **Create URLs**
```python
# apps/new_module/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewModelViewSet

router = DefaultRouter()
router.register(r'items', NewModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

7. **Register in Main URLs**
```python
# config/urls.py
urlpatterns = [
    # ...
    path('api/v1/new-module/', include('apps.new_module.urls')),
]
```

8. **Run Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Code Style Guidelines

**Python/Django:**
- Follow PEP 8
- Use descriptive variable names
- Add docstrings to functions and classes
- Use type hints where appropriate

**JavaScript/React:**
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful component names
- Keep components small and focused

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production Checklist

- [ ] Set `DEBUG=False` in backend .env
- [ ] Generate secure `SECRET_KEY`
- [ ] Configure production database credentials
- [ ] Set up SSL/HTTPS
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up static file serving (nginx/CDN)
- [ ] Configure media file storage (S3/Azure Blob)
- [ ] Set up backup strategy
- [ ] Configure logging
- [ ] Set up monitoring

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /var/www/backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /var/www/backend/media/;
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
django.db.utils.OperationalError: (2002, "Can't connect to MySQL server")
```

**Solution:**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check database credentials in .env
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

#### 2. CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
- Verify `CORS_ALLOWED_ORIGINS` in backend .env
- Ensure frontend URL is in the allowed list
- Restart backend server after changes

#### 3. JWT Token Expired
```
401 Unauthorized - Token is invalid or expired
```

**Solution:**
- Frontend should automatically refresh tokens
- Check token refresh logic in `api.js`
- Clear localStorage and re-login

#### 4. File Upload Error
```
413 Request Entity Too Large
```

**Solution:**
- Increase `FILE_UPLOAD_MAX_MEMORY_SIZE` in settings.py
- Configure nginx `client_max_body_size`

#### 5. Migration Conflicts
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```

**Solution:**
```bash
python manage.py migrate --fake app_name zero
python manage.py migrate app_name
```

#### 6. Node Modules Issues
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

**Backend:**
```python
# settings.py
DEBUG = True
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Frontend:**
```javascript
// In any component
console.log('Debug:', data);

// Or use React DevTools
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support, email support@yourcompany.com or open an issue in the repository.

---

## 🙏 Acknowledgments

- Django REST Framework team
- React team
- Tailwind CSS team
- All open-source contributors

---

<div align="center">
  <p>Made with ❤️ for the manufacturing industry</p>
  <p>© 2024 Manufacturing ERP. All rights reserved.</p>
</div>