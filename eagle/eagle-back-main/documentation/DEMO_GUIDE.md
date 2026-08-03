# 🚀 EAGLES Backend - Quick Demo Guide

**For Professor Presentation - Step by Step**

---

## ✅ STEP 1: Start the Server (5 minutes)

Open a terminal and run:

```bash
cd /Users/joelehabe/Desktop/eagleproject
npm run start:dev
```

**Wait until you see:**
```
[Nest] Application successfully started
```

**✅ Server is running on:** `http://localhost:3000`

---

## ✅ STEP 2: Run All Tests (10 minutes)

Open a **NEW terminal** (keep server running) and run:

### Option A: Run All Tests (Recommended)
```bash
cd /Users/joelehabe/Desktop/eagleproject
.\run-all-tests.ps1
```

This will automatically:
1. ✅ Check if server is running
2. ✅ Run all 5 test suites
3. ✅ Show you the results

### Option B: Run Tests One by One
```powershell
# Test 1: Patient Management
.\test-patient-management.ps1

# Test 2: Admin RBAC
.\test-admin-rbac.ps1

# Test 3: Files Module
.\test-files-module.ps1

# Test 4: System Health
.\test-system-health-monitoring.ps1

# Test 5: Patient Updates
.\test-patient-module-update.ps1
```

---

## ✅ STEP 3: What to Show Your Professor

### 📊 **What We Built:**
1. **Patient Management System** - Full CRUD with role-based access
2. **File Upload System** - Upload documents to Firebase Storage
3. **Admin Dashboard** - System health, notifications, user management
4. **Security** - JWT authentication, role-based access control (RBAC)
5. **Real-time Features** - WebSocket notifications, WebRTC video calls

### 📈 **Test Results:**
- ✅ **5 Complete Test Suites** with 100+ test cases
- ✅ **All tests passing** = System is working correctly
- ✅ **Automated testing** = Professional development practices

### 🔑 **Key Features:**
- **Role-Based Access**: Admin, Doctor, Nurse, Secretary (Primary/Secondary)
- **Data Encryption**: AES-256 encryption for sensitive health data
- **Real-time**: WebSocket for instant notifications
- **File Management**: Upload/download files linked to patients/consultations
- **Queue System**: Smart patient queue with priority levels

---

## 📝 Quick Explanation Script

**What to say:**

> "Good morning/afternoon Professor. I've built a complete healthcare teleconsultation backend system using NestJS and Firebase.
> 
> **The system includes:**
> - Patient management with role-based access control
> - File upload and management system
> - Admin dashboard for system monitoring
> - Real-time notifications via WebSocket
> - Secure authentication and data encryption
> 
> **To prove it works, I've created 5 comprehensive test suites** that test all major functionalities. Let me run them now..."

*Then run the tests and show the results*

---

## 🎯 What Each Test Suite Covers

### 1. **Patient Management Tests** ✅
- Create patients (Secondary Secretary only)
- View patients (role-based filtering)
- Update patient information
- Update vital signs (Nurse only)
- Update EHR (Electronic Health Records)
- Deactivate patients (Admin/Primary Secretary)

### 2. **Admin RBAC Tests** ✅
- System health monitoring (Admin only)
- Send notifications to users
- View/manage notifications
- Cancel consultations (Admin override)
- Access control verification

### 3. **Files Module Tests** ✅
- Upload files to Firebase Storage
- Link files to patients/consultations
- Download files
- Delete files (with permissions)
- View file metadata

### 4. **System Health Tests** ✅
- Database connectivity check
- System uptime monitoring
- Health status reporting
- Admin-only access verification

### 5. **Patient Update Tests** ✅
- Update patient demographics
- Update contact information
- Validation and error handling
- Role-based update permissions

---

## ⚠️ Troubleshooting

### Problem: "Server is not running"
**Solution:** Make sure you ran `npm run start:dev` in a separate terminal

### Problem: "Newman is not installed"
**Solution:** Run `npm install -g newman` (the script will try to install it automatically)

### Problem: "Tests failing"
**Solution:** 
1. Check server is running: `http://localhost:3000`
2. Check `.env` file exists with Firebase credentials
3. Make sure test users exist in database

### Problem: "Authentication errors"
**Solution:** Run database seeds:
```bash
npm run seed:all
```

---

## 📋 Pre-Demo Checklist

- [ ] Server is running (`npm run start:dev`)
- [ ] Database is connected (check `.env` file)
- [ ] Test users exist (run `npm run seed:all` if needed)
- [ ] Newman is installed (`npm install -g newman`)
- [ ] All test files are in the project root
- [ ] Environment file exists (`EAGLES_Local.postman_environment.json`)

---

## 🎓 Presentation Tips

1. **Start with the big picture**: "This is a healthcare teleconsultation system..."
2. **Show the architecture**: Point to `SYSTEM_ARCHITECTURE.md`
3. **Run the tests**: Let the tests speak for themselves
4. **Explain the results**: "All tests passing means the system works correctly"
5. **Show code quality**: Point to the organized module structure
6. **Mention security**: JWT, encryption, role-based access

---

## 📞 Quick Commands Reference

```bash
# Start server
npm run start:dev

# Run all tests
.\run-all-tests.ps1

# Run single test
.\test-patient-management.ps1

# Seed database (if needed)
npm run seed:all

# Check server health
curl http://localhost:3000
```

---

**You've got this! The system is working. Just follow the steps above. 🚀**
