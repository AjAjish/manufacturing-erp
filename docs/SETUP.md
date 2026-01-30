# 🚀 Complete Setup Guide

This guide provides detailed step-by-step instructions for setting up the Manufacturing ERP system.

## Table of Contents
- [System Requirements](#system-requirements)
- [Quick Start (5 minutes)](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration Options](#configuration-options)
- [Verification Steps](#verification-steps)
- [Common Setup Issues](#common-setup-issues)

---

## System Requirements

### Minimum Requirements
| Component | Requirement |
|-----------|-------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Storage | 10 GB |
| OS | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ |

### Software Requirements
| Software | Version | Download |
|----------|---------|----------|
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| MySQL | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| Git | 2.30+ | [git-scm.com](https://git-scm.com/downloads) |

---

## Quick Start

For experienced developers who want to get up and running quickly:

```bash
# Clone repository
git clone https://github.com/yourusername/manufacturing-erp.git
cd manufacturing-erp

# Setup database
mysql -u root -p -e "CREATE DATABASE manufacturing_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cat > .env << EOF
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
DB_NAME=manufacturing_erp
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF
python manage.py migrate
python manage.py shell < ../seed_data/seed.py
python manage.py runserver &

# Frontend setup (new terminal)
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev

# Access application
# Frontend: http://localhost:3000
# Login: admin@example.com / Admin@123
```

---

## Detailed Installation

### Step 1: Install Prerequisites

#### Windows

1. **Install Python 3.10+**
   - Download from [python.org](https://www.python.org/downloads/)
   - Check "Add Python to PATH" during installation
   - Verify: `python --version`

2. **Install Node.js 18+**
   - Download LTS version from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

3. **Install MySQL 8.0+**
   - Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
   - Choose "Developer Default" setup type
   - Set root password during installation
   - Verify: `mysql --version`

4. **Install Git**
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Use default options during installation
   - Verify: `git --version`

#### macOS

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.11
brew install node@18
brew install mysql
brew install git

# Start MySQL service
brew services start mysql

# Verify installations
python3 --version
node --version
mysql --version
git --version
```

#### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install MySQL
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation

# Install Git
sudo apt install git

# Verify installations
python3 --version
node --version
mysql --version
git --version
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/manufacturing-erp.git

# Navigate to project directory
cd manufacturing-erp

# View project structure
ls -la
```

### Step 3: Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE manufacturing_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# (Optional) Create dedicated user
CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON manufacturing_erp.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;

# Verify database creation
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### Step 4: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use any text editor
```

**Configure .env file:**
```env
# Django Settings
SECRET_KEY=your-very-long-and-secure-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=manufacturing_erp
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

```bash
# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (follow prompts)
python manage.py createsuperuser

# Load sample data
python manage.py shell < ../seed_data/seed.py

# Collect static files
python manage.py collectstatic --noinput

# Start development server
python manage.py runserver
```

Backend should now be running at: http://localhost:8000

### Step 5: Setup Frontend

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Start development server
npm run dev
```

Frontend should now be running at: http://localhost:3000

### Step 6: Verify Installation

1. **Open Frontend**: http://localhost:3000
2. **Login with seed data credentials**:
   - Email: `admin@example.com`
   - Password: `Admin@123`
3. **Check Dashboard** loads with sample data
4. **Test API Documentation**: http://localhost:8000/api/docs/
5. **Access Django Admin**: http://localhost:8000/admin/

---

## Configuration Options

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key | None | Yes |
| `DEBUG` | Debug mode | False | No |
| `ALLOWED_HOSTS` | Allowed host names | localhost | Yes (prod) |
| `DB_NAME` | Database name | manufacturing_erp | Yes |
| `DB_USER` | Database user | root | Yes |
| `DB_PASSWORD` | Database password | None | Yes |
| `DB_HOST` | Database host | localhost | No |
| `DB_PORT` | Database port | 3306 | No |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs | localhost:3000 | Yes |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | /api/v1 | Yes |

### JWT Configuration (settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Adjust as needed
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # Adjust as needed
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### File Upload Configuration (settings.py)

```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_DRAWING_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.step', '.stp', '.igs', '.iges']
```

---

## Verification Steps

### 1. Backend Health Check

```bash
# Check if server is running
curl http://localhost:8000/api/v1/accounts/users/me/

# Should return 401 Unauthorized (expected without token)
```

### 2. Database Connection

```bash
cd backend
source venv/bin/activate
python manage.py dbshell

# Run a test query
SELECT COUNT(*) FROM accounts_user;
```

### 3. API Authentication Test

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin@123"}'

# Should return access and refresh tokens
```

### 4. Frontend Connection Test

1. Open browser console (F12)
2. Navigate to http://localhost:3000
3. Check for any CORS or connection errors
4. Login should work without errors

---

## Common Setup Issues

### Issue 1: MySQL Connection Refused

**Error:** `Can't connect to MySQL server on 'localhost'`

**Solutions:**
```bash
# Check if MySQL is running
# Windows:
net start mysql
# macOS:
brew services start mysql
# Linux:
sudo systemctl start mysql

# Check MySQL status
sudo systemctl status mysql
```

### Issue 2: Python Virtual Environment Issues

**Error:** `venv is not recognized` or `command not found`

**Solutions:**
```bash
# Install venv module
sudo apt install python3-venv  # Ubuntu/Debian
pip install virtualenv          # Alternative

# Use python3 explicitly
python3 -m venv venv
```

### Issue 3: Node.js Version Mismatch

**Error:** `Unsupported engine` or compatibility errors

**Solutions:**
```bash
# Check current version
node --version

# Use nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Issue 4: Permission Denied on Linux/Mac

**Error:** `Permission denied` when installing packages

**Solutions:**
```bash
# Don't use sudo with pip in venv
source venv/bin/activate
pip install -r requirements.txt

# For npm global packages
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue 5: CORS Errors in Browser

**Error:** `Access-Control-Allow-Origin` error

**Solutions:**
1. Verify `CORS_ALLOWED_ORIGINS` in backend .env
2. Ensure the frontend URL matches exactly (including port)
3. Restart backend server after changes
4. Clear browser cache

### Issue 6: Module Not Found Errors

**Error:** `ModuleNotFoundError: No module named 'xxx'`

**Solutions:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Verify you're in the right directory
cd backend
pip install -r requirements.txt

# Check installed packages
pip list
```

### Issue 7: Database Migration Errors

**Error:** `django.db.utils.OperationalError`

**Solutions:**
```bash
# Reset migrations (development only!)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Recreate database
mysql -u root -p -e "DROP DATABASE manufacturing_erp; CREATE DATABASE manufacturing_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations fresh
python manage.py makemigrations
python manage.py migrate
```

---

## Next Steps

After successful setup:

1. ✅ Explore the dashboard at http://localhost:3000
2. ✅ Review API documentation at http://localhost:8000/api/docs/
3. ✅ Create test orders and go through the workflow
4. ✅ Customize roles and permissions as needed
5. ✅ Configure email notifications (optional)
6. ✅ Set up backup procedures
7. ✅ Plan for production deployment

---

## Getting Help

- 📖 Check the main [README.md](../README.md) for detailed documentation
- 🐛 Report issues on GitHub Issues
- 💬 Join our community Discord
- 📧 Email support@yourcompany.com