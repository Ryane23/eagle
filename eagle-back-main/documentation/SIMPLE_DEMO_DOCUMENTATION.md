# 📚 EAGLES Backend - Simple Demo Documentation

**Everything you need to present your backend to your professor**

---

## 🏗️ Architecture & Technology

### What We Used

**Backend Framework:**
- **NestJS** - A Node.js framework (like Express but more structured)
- **TypeScript** - For type safety and better code quality

**Database:**
- **Firebase Firestore** - NoSQL database (Google's cloud database)
- Stores: Users, Patients, Consultations, Urgencies, etc.

**Authentication:**
- **JWT (JSON Web Tokens)** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Different permissions for different roles

**Real-time Communication:**
- **WebSocket (Socket.io)** - For real-time notifications
- **WebRTC** - For video calls between doctors and patients

**File Storage:**
- **Firebase Storage** - For storing patient documents, images, etc.

**Security:**
- **AES-256 Encryption** - Encrypts sensitive health data
- **JWT Tokens** - Secure API access

**Testing:**
- **Postman Collections** - API testing (like a checklist for each endpoint)
- **Newman** - Command-line tool to run Postman tests automatically
- **PowerShell Scripts** - To run tests easily

---

## 🧪 Testing Approach

### Why We Test
- **Prove the system works** - Tests verify each feature functions correctly
- **Catch bugs early** - Find problems before users do
- **Documentation** - Tests show how the system should work

### How We Test
1. **Postman Collections** - Each collection tests a specific module
2. **Automated Scripts** - PowerShell scripts run tests automatically
3. **Expected Results** - We know what should happen, tests verify it

### What Tests Cover
- ✅ **API Endpoints** - Do they work?
- ✅ **Access Control** - Can only authorized users access?
- ✅ **Data Validation** - Is bad data rejected?
- ✅ **Error Handling** - Are errors handled properly?

---

## 📋 Test Suites Overview

We have **8 test suites**, organized by the EAGLE workflow order:

### Core Workflow (In Sequence):
1. **Patient Management** - Patient registration (foundation)
2. **Urgencies Module** - Create urgency → Validate → Assign doctor (creates consultation + queue entry)
3. **Consultations Module** - Consultation operations (start, notes, complete)
4. **Queue Module** - Queue management with priority algorithm (works with consultations)

### Supporting/Administrative:
5. **Admin RBAC** - Admin-only features
6. **Files Module** - File upload and management
7. **System Health** - System monitoring
8. **Patient Updates** - Updating patient information

**Workflow Sequence:**
```
Patient Management → Urgencies → Consultations → Queue
                          ↓            ↓           ↓
                    (Creates consultation + queue entry automatically)
```

---

## 🧪 Test Suite 1: Patient Management

### What This Tests
**Use Case:** A secretary needs to register a new patient, update their information, and a nurse needs to record vital signs.

**Real-World Scenario:**
- Patient arrives at hospital
- Secretary creates patient record
- Nurse takes vital signs (blood pressure, temperature, etc.)
- Doctor can view patient information

### What We're Testing
- ✅ Create new patients (Secretary only)
- ✅ View patients (role-based - Secretary sees only their hospital)
- ✅ Update patient information
- ✅ Update vital signs (Nurse only)
- ✅ Update Electronic Health Records (EHR)
- ✅ Deactivate patients (Admin only)
- ✅ Access control (wrong role = denied)

### Command to Run
```powershell
.\tests\scripts\test-patient-management.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Logs in as different users (Admin, Secretary, Nurse, Doctor)
2. Creates a test patient
3. Tests viewing patients (different roles see different results)
4. Tests updating patient info
5. Tests updating vital signs (only Nurse can do this)
6. Tests updating EHR
7. Tests deactivating patient (only Admin can do this)
8. Verifies access control (wrong role gets 403 Forbidden)

**Expected Result:** All tests pass = Patient management works correctly

---

## 🧪 Test Suite 2: Admin RBAC (Role-Based Access Control)

### What This Tests
**Use Case:** An admin needs to monitor system health, send notifications, and manage consultations.

**Real-World Scenario:**
- Admin checks if system is healthy
- Admin sends important notification to all doctors
- Admin can cancel any consultation if needed
- Regular users cannot access admin features

### What We're Testing
- ✅ System health monitoring (Admin only)
- ✅ Send notifications to users (Admin only)
- ✅ View notifications
- ✅ Mark notifications as read
- ✅ Delete notifications (Admin only)
- ✅ Cancel consultations (Admin can cancel any)
- ✅ Access control (non-admin users denied)

### Command to Run
```powershell
.\tests\scripts\test-admin-rbac.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Logs in as Admin
2. Checks system health (Admin can access, Doctor cannot)
3. Sends notifications to different users
4. Views notifications
5. Marks notifications as read
6. Tries to delete notification (Admin can, Doctor cannot)
7. Cancels a consultation (Admin can cancel any)
8. Verifies non-admin users are denied access

**Expected Result:** All tests pass = Admin features work and access control is enforced

---

## 🧪 Test Suite 3: Files Module

### What This Tests
**Use Case:** Users need to upload patient documents (lab results, X-rays, prescriptions) and link them to patients or consultations.

**Real-World Scenario:**
- Doctor uploads lab results for a patient
- Secretary uploads patient ID document
- Files are linked to specific patients or consultations
- Users can download files they have access to

### What We're Testing
- ✅ Upload files to Firebase Storage
- ✅ Link files to patients
- ✅ Link files to consultations
- ✅ View file metadata
- ✅ Download files
- ✅ Delete files (only owner or Admin)
- ✅ Access control (users can only delete their own files)

### Command to Run
```powershell
.\tests\scripts\test-files-module.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Logs in as different users
2. Uploads test files (images, documents)
3. Links files to patients
4. Links files to consultations
5. Views file information
6. Downloads files
7. Tries to delete files (owner can, others cannot)
8. Verifies files are stored correctly

**Expected Result:** All tests pass = File upload and management works correctly

---

## 🧪 Test Suite 4: System Health Monitoring

### What This Tests
**Use Case:** Admin needs to check if the system is running properly, database is connected, and system is healthy.

**Real-World Scenario:**
- Admin checks system status daily
- Verifies database connection is working
- Checks system uptime
- Only Admin can access this information

### What We're Testing
- ✅ Get system health status (Admin only)
- ✅ Check database connectivity
- ✅ Get system uptime
- ✅ Access control (non-admin denied)
- ✅ Health status reporting

### Command to Run
```powershell
.\tests\scripts\test-system-health-monitoring.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Logs in as Admin
2. Checks system health endpoint
3. Verifies database is connected
4. Checks system uptime
5. Tries to access as non-admin (should be denied)
6. Verifies health status is accurate

**Expected Result:** All tests pass = System monitoring works and access is restricted to Admin

---

## 🧪 Test Suite 5: Patient Module Update

### What This Tests
**Use Case:** Patient information needs to be updated (address changed, phone number updated, etc.)

**Real-World Scenario:**
- Patient moves to new address
- Patient changes phone number
- Secretary updates patient information
- Only authorized users can update

### What We're Testing
- ✅ Update patient demographics
- ✅ Update contact information
- ✅ Update address
- ✅ Validation (rejects invalid data)
- ✅ Access control (only authorized roles can update)

### Command to Run
```powershell
.\tests\scripts\test-patient-module-update.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Logs in as Secretary
2. Updates patient information (name, address, phone)
3. Verifies updates are saved correctly
4. Tests validation (rejects invalid phone numbers, etc.)
5. Tests access control (unauthorized users denied)
6. Verifies data integrity

**Expected Result:** All tests pass = Patient updates work correctly with proper validation

---

## 🧪 Test Suite 6: Urgencies Module

### What This Tests
**Use Case:** Complete urgency workflow from creation to completion - the entry point of the teleconsultation process.

**Real-World Scenario:**
- Patient arrives at secondary center
- Secondary Secretary creates urgency request
- Primary Secretary validates and escalates urgency level if needed
- Primary Secretary assigns doctor
- Consultation is automatically created
- Workflow continues to consultation phase

### What We're Testing
- ✅ Create urgency request (Secondary Secretary only)
- ✅ Get pending urgencies (Primary Secretary only)
- ✅ Validate urgency with level modification
- ✅ Assign doctor to urgency (auto-creates consultation)
- ✅ Update vital signs (Nurse only)
- ✅ Start consultation (Doctor only)
- ✅ Complete urgency (Doctor only)
- ✅ Reject urgency (Primary Secretary, Doctor)
- ✅ State machine transitions (PENDING → VALIDATED → ASSIGNED → IN_PROGRESS → COMPLETED)
- ✅ Role-based access control
- ✅ Consultation auto-creation on assignment

### Command to Run
```powershell
.\tests\scripts\test-urgencies-module.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Creates urgency request (Secondary Secretary)
2. Validates urgency (Primary Secretary, escalates level)
3. Assigns doctor (Primary Secretary, creates consultation automatically)
4. Updates vital signs (Nurse)
5. Starts consultation (Doctor)
6. Completes urgency (Doctor)
7. Tests state transitions and role-based access

**Expected Result:** All tests pass = Complete urgency workflow works correctly

---

## 🧪 Test Suite 7: Queue Module

### What This Tests
**Use Case:** Queue management with intelligent priority-based scheduling for patient consultations.

**Real-World Scenario:**
- Patients are added to queue when consultation is scheduled
- Queue uses advanced priority algorithm (urgency + wait time)
- Queue positions recalculate automatically
- Estimated wait times are calculated
- Queue status updates when consultations start/complete

### What We're Testing
- ✅ Add patient to queue (automatic priority calculation)
- ✅ Get queue entries (role-based filtering)
- ✅ Get queue by status
- ✅ Get queue statistics
- ✅ Update queue status (WAITING → IN_PROGRESS → COMPLETED)
- ✅ Priority algorithm verification (CRITICAL > LOW)
- ✅ Position recalculation
- ✅ Estimated wait time calculation
- ✅ Role-based filtering (Secondary Secretary sees only their hospital)

### Command to Run
```powershell
.\tests\scripts\test-queue-module.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Adds patients to queue with different urgency levels
2. Verifies priority calculation (higher urgency = higher priority)
3. Tests position recalculation
4. Tests wait time estimation
5. Updates queue status (start/complete consultation)
6. Tests role-based filtering

**Expected Result:** All tests pass = Queue management with priority algorithm works correctly

---

## 🧪 Test Suite 8: Consultations Module

### What This Tests
**Use Case:** Complete consultation lifecycle from scheduling to completion.

**Real-World Scenario:**
- Consultation is created when urgency is assigned
- Doctor views schedule and starts consultation
- Doctor and Nurse add notes during consultation
- Doctor completes consultation with diagnosis
- Queue status updates automatically

### What We're Testing
- ✅ Get doctor's schedule (upcoming and active consultations)
- ✅ Get all my consultations (doctor)
- ✅ Get consultations by patient
- ✅ Get consultation by ID
- ✅ Start consultation (SCHEDULED → IN_PROGRESS)
- ✅ Add notes during consultation (Doctor, Nurse)
- ✅ Complete consultation (IN_PROGRESS → COMPLETED)
- ✅ Cancel consultation (Doctor, Primary Secretary, Admin)
- ✅ Queue integration (automatic status updates)
- ✅ Role-based access control

### Command to Run
```powershell
.\tests\scripts\test-consultations-module.ps1
```

### What to Expect
**Success looks like:**
```
✅ Server is running
✅ Running Postman collection tests...
✅ All tests passed!
```

**What the test does:**
1. Gets doctor's schedule
2. Starts consultation (updates queue automatically)
3. Adds notes (Doctor and Nurse)
4. Completes consultation (adds diagnosis, updates queue)
5. Tests cancellation (different roles)
6. Verifies queue integration
7. Tests role-based access

**Expected Result:** All tests pass = Consultation workflow works correctly with queue integration

---

## 🚀 How to Run Tests (Step by Step)

### Prerequisites
1. **Server must be running**
   ```bash
   npm run start:dev
   ```
   Wait until you see: `Application successfully started`

2. **Newman must be installed** (for running Postman tests)
   ```bash
   npm install -g newman
   ```
   (The scripts will try to install this automatically)

### Running Individual Tests

**Terminal 1** (Keep this running):
```bash
npm run start:dev
```

**Terminal 2** (Run tests here):
```powershell
# Core Workflow (In EAGLE use case order):
# Test 1: Patient Management (Foundation - Patient Registration)
.\tests\scripts\test-patient-management.ps1

# Test 2: Urgencies Module (Create → Validate → Assign doctor)
.\tests\scripts\test-urgencies-module.ps1

# Test 3: Consultations Module (Consultation created automatically when urgency assigned)
.\tests\scripts\test-consultations-module.ps1

# Test 4: Queue Module (Queue entry created automatically with consultation)
.\tests\scripts\test-queue-module.ps1

# Supporting/Administrative Tests:
# Test 5: Admin RBAC
.\tests\scripts\test-admin-rbac.ps1

# Test 6: Files Module
.\tests\scripts\test-files-module.ps1

# Test 7: System Health
.\tests\scripts\test-system-health-monitoring.ps1

# Test 8: Patient Updates
.\tests\scripts\test-patient-module-update.ps1
```

---

## ❓ Common Questions & Answers

### Q: What is Postman?
**A:** Postman is a tool for testing APIs. We use it to send requests to our backend and verify responses. It's like a checklist - we test each endpoint to make sure it works.

### Q: What is Newman?
**A:** Newman is a command-line tool that runs Postman collections automatically. Instead of clicking buttons in Postman, we can run all tests with one command.

### Q: Why PowerShell scripts?
**A:** PowerShell scripts make it easy to run tests. They check if the server is running, run the tests, and show you the results. It's automation - one command does everything.

### Q: What if a test fails?
**A:** The test output will show which specific test failed and why. Common reasons:
- Server not running → Start server with `npm run start:dev`
- Database connection issue → Check `.env` file
- Test user doesn't exist → Run `npm run seed:all`

### Q: How do we know the system works?
**A:** When all tests pass, it means:
- All API endpoints respond correctly
- Access control is working (wrong users are denied)
- Data validation works (bad data is rejected)
- The system behaves as expected

### Q: What's the difference between these test suites?
**A:** Each suite tests a different module:
- **Patient Management** = Patient CRUD operations
- **Admin RBAC** = Admin-only features
- **Files Module** = File upload/download
- **System Health** = System monitoring
- **Patient Updates** = Updating patient info
- **Urgencies Module** = Complete urgency workflow (entry point)
- **Queue Module** = Queue management with priority algorithm
- **Consultations Module** = Consultation operations and workflow

### Q: Can we test everything at once?
**A:** Yes, you can run `.\run-all-tests.ps1` to run all 8 test suites automatically. But for the demo, running them one by one is better because you can explain each one. You can also run the workflow tests in sequence (Urgencies → Consultations → Queue) to show the complete flow.

### Q: What if the professor asks about a specific feature?
**A:** Each test suite covers specific features. If they ask about:
- **Patients** → Show Test Suite 1
- **Admin features** → Show Test Suite 2
- **File uploads** → Show Test Suite 3
- **System monitoring** → Show Test Suite 4
- **Patient updates** → Show Test Suite 5
- **Urgency workflow** → Show Test Suite 6 (entry point of process)
- **Queue management** → Show Test Suite 7 (priority algorithm)
- **Consultations** → Show Test Suite 8 (core business logic)
- **Complete workflow** → Run Test Suites 6 → 8 in sequence

### Q: How do we prove security?
**A:** The tests verify access control:
- Wrong role = 403 Forbidden (tested in each suite)
- No token = 401 Unauthorized
- Admin-only features = Only Admin can access (Test Suite 2)

### Q: What about encryption?
**A:** Sensitive health data (symptoms, diagnosis, notes) is encrypted using AES-256. The system automatically encrypts when saving and decrypts when reading. This is tested implicitly - if encryption was broken, data wouldn't save/load correctly.

---

## 📊 Test Results Interpretation

### ✅ All Tests Pass
**Meaning:** The system works correctly. All features function as expected.

**What to say:**
> "All tests passed, which means the system is working correctly. Each test verified a specific feature, and they all passed."

### ❌ Some Tests Fail
**Meaning:** There's an issue with a specific feature.

**What to do:**
1. Check the error message
2. Common fixes:
   - Server not running → Start server
   - Database issue → Check `.env` file
   - Missing test data → Run `npm run seed:all`

**What to say:**
> "Some tests failed, which helps us identify issues. The error messages tell us exactly what's wrong so we can fix it."

---

## 🎯 Presentation Flow

### 1. Introduction (2 minutes)
> "We built a healthcare teleconsultation backend system using NestJS and Firebase. To prove it works, we created 5 automated test suites."

### 2. Explain Architecture (2 minutes)
> "We used NestJS for the backend, Firebase for the database, JWT for authentication, and Postman/Newman for testing."

### 3. Run Tests One by One (15 minutes)
> "Let me show you each test suite. We have 8 comprehensive test suites covering all major features. First, Patient Management..."

**Recommended Order for Demo (EAGLE Workflow Sequence):**
1. Patient Management (foundation - patient registration)
2. Urgencies Module (workflow entry point - create urgency, validate, assign)
3. Consultations Module (consultation operations - created automatically when urgency assigned)
4. Queue Module (queue management - queue entry created automatically with consultation)
5. Admin RBAC (administrative features)
6. Files Module (supporting feature)

Run each test and explain:
- What it tests
- Why it's important
- What the results mean

**Workflow Demonstration:**
> "Let me show you the complete workflow by running Urgencies → Consultations → Queue in sequence. This demonstrates the end-to-end process from patient arrival to consultation completion."

### 4. Show Results (2 minutes)
> "All 8 test suites passed, which proves the system works correctly. The tests verify API endpoints, access control, data validation, error handling, and the complete workflow from urgency creation through consultation completion. We have comprehensive coverage of all core features including the complete teleconsultation workflow."

### 5. Answer Questions (5 minutes)
Use the Q&A section above to answer questions.

---

## ✅ Pre-Demo Checklist

Before your presentation:
- [ ] Server starts successfully (`npm run start:dev`)
- [ ] All test scripts exist in project root
- [ ] Environment file exists (`EAGLES_Local.postman_environment.json`)
- [ ] Newman is installed (`npm install -g newman`)
- [ ] Test users exist in database (run `npm run seed:all` if needed)
- [ ] You've read this documentation
- [ ] You understand what each test does

---

## 🎓 Key Points to Remember

1. **Tests prove the system works** - All passing = System works
2. **Each test suite has a purpose** - Tests specific features
3. **Access control is tested** - Wrong users are denied
4. **Real-world use cases** - Each test represents a real scenario
5. **Automated testing** - Professional development practice

---

---

## 🎯 Complete Workflow Test Sequence

To demonstrate the complete end-to-end workflow according to EAGLE use case, run these tests in sequence:

```powershell
# Step 1: Patient Registration (Foundation)
.\tests\scripts\test-patient-management.ps1

# Step 2: Create Urgency Request
.\tests\scripts\test-urgencies-module.ps1

# Step 3: Consultation Operations (Consultation created when urgency assigned)
.\tests\scripts\test-consultations-module.ps1

# Step 4: Queue Management (Queue entry created automatically with consultation)
.\tests\scripts\test-queue-module.ps1
```

**Workflow Flow:**
1. **Patient Management**: Patient registration (Secondary Secretary)
2. **Urgencies Module**: Create urgency → Validate → Assign doctor 
   - ⚠️ **Important**: When doctor is assigned, system automatically:
     - Creates consultation
     - Adds consultation to queue
3. **Consultations Module**: Start consultation → Add notes → Complete consultation
   - ⚠️ **Important**: When consultation starts/completes, queue status updates automatically
4. **Queue Module**: Queue operations, priority calculation, position tracking

This demonstrates the complete EAGLE workflow:
- **Patient Registration** → **Urgency Creation** → **Validation** → **Assignment** 
- **Consultation Created** (automatically) → **Queue Entry Created** (automatically)
- **Consultation Operations** → **Queue Status Updates** (automatically)

**You're ready! Just follow this guide step by step. Good luck! 🚀**
