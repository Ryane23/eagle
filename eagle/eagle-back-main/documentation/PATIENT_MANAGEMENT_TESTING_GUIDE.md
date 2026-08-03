# Patient Management Module - Testing Guide

## Overview

This guide covers comprehensive testing of the Patient Management Module, including CRUD operations, role-based access control, vital signs tracking, EHR management, and patient deactivation.

## Module Functionalities

### 1. Patient CRUD Operations
- **Create Patient**: Secondary Secretary only
- **Get All Patients**: Role-based (Secondary Secretary sees only their hospital, others see all)
- **Search Patients**: Role-based search with filtering
- **Get Patient by ID**: Role-based access control
- **Update Patient**: Secondary Secretary (own hospital) or Admin
- **Deactivate Patient**: Admin or Primary Secretary

### 2. Vital Signs Management
- **Update Vital Signs**: Nurse only
- Tracks: Blood pressure, heart rate, temperature, weight, height
- Records: Update timestamp and nurse ID

### 3. Electronic Health Records (EHR)
- **Update EHR**: Nurse, Doctor, or Secondary Secretary
- Fields: Medical history, allergies, current medications, blood type
- Data is encrypted (AES-256) for sensitive fields

### 4. Role-Based Access Control
- **Admin**: Full access to all patients
- **Primary Secretary**: Can deactivate patients, view all patients
- **Secondary Secretary**: Can create/update patients in own hospital only
- **Doctor**: Can view all patients, update EHR
- **Nurse**: Can view patients in own hospital, update vital signs and EHR

## Test Collection Structure

### Setup (5 requests)
1. Login - Admin
2. Login - Secondary Secretary
3. Login - Nurse
4. Login - Doctor
5. Login - Primary Secretary

### Create Patient (4 requests)
1. Create Patient - Secondary Secretary (Success)
2. Create Patient - Admin (Forbidden)
3. Create Patient - Duplicate ID Number (Conflict)
4. Create Patient - Validation Error (Missing Fields)

### Get All Patients (3 requests)
1. Get All Patients - Admin (All Patients)
2. Get All Patients - Secondary Secretary (Own Hospital Only)
3. Get All Patients - Doctor (All Patients)

### Search Patients (4 requests)
1. Search Patients - By First Name
2. Search Patients - By Last Name
3. Search Patients - Empty Query (Returns Empty)
4. Search Patients - Secondary Secretary (Own Hospital Only)

### Get Patient by ID (3 requests)
1. Get Patient by ID - Admin (Success)
2. Get Patient by ID - Secondary Secretary (Success)
3. Get Patient by ID - Not Found

### Update Patient (4 requests)
1. Update Patient - Secondary Secretary (Success)
2. Update Patient - Admin (Success)
3. Update Patient - Nurse (Forbidden)
4. Update Patient - Duplicate ID Number (Conflict)

### Update Vital Signs (3 requests)
1. Update Vital Signs - Nurse (Success)
2. Update Vital Signs - Doctor (Forbidden)
3. Update Vital Signs - Empty Object (Validation Error)

### Update EHR (4 requests)
1. Update EHR - Nurse (Success)
2. Update EHR - Doctor (Success)
3. Update EHR - Secondary Secretary (Success)
4. Update EHR - Partial Update (Only Medical History)

### Deactivate Patient (5 requests)
1. Deactivate Patient - Admin (Success)
2. Create Patient for Deactivation Test
3. Deactivate Patient - Primary Secretary (Success)
4. Deactivate Patient - Nurse (Forbidden)
5. Deactivate Patient - Not Found

### Integration Tests (2 requests)
1. Verify Patient Data After All Updates
2. Verify Deactivated Patient Not in Active List

## Prerequisites

1. **Server Running**: Ensure the NestJS server is running on `http://localhost:3000`
   ```bash
   npm run start:dev
   ```

2. **Newman Installed**: Install Newman CLI for running Postman collections
   ```bash
   npm install -g newman
   ```

3. **Environment File**: Ensure `EAGLES_Local.postman_environment.json` exists with:
   - `baseUrl`: `http://localhost:3000`
   - Authentication tokens (will be set automatically during setup)

4. **Test Users**: Ensure the following users exist in the system:
   - Admin: `admin@eagles.com` / `Admin@123456`
   - Secondary Secretary: `secretary.douala@eagles.com` / `Douala@123`
   - Nurse: `nurse.douala@eagles.com` / `Nurse@123`
   - Doctor: `doctor.nana@eagles.com` / `Doctor@123`
   - Primary Secretary: `secretary.primary@eagles.com` / `Primary@123`

## Running Tests

### Automated Testing (PowerShell)

```powershell
.\test-patient-management.ps1
```

This script will:
1. Check if Newman is installed
2. Verify server is running
3. Run the Postman collection
4. Display test results

### Manual Testing (Postman)

1. **Import Collection**: Import `EAGLES_Patient_Management_Postman_Collection.json` into Postman
2. **Import Environment**: Import `EAGLES_Local.postman_environment.json`
3. **Run Collection**: Click "Run" and execute all requests

### Newman CLI (Manual)

```bash
newman run "EAGLES_Patient_Management_Postman_Collection.json" \
  -e "EAGLES_Local.postman_environment.json" \
  --reporters cli,json \
  --reporter-json-export "patient-management-test-results.json"
```

## Test Scenarios

### 1. Patient Creation
- ✅ Secondary Secretary can create patients
- ❌ Admin cannot create patients (403 Forbidden)
- ❌ Duplicate ID number rejected (409 Conflict)
- ❌ Validation errors for missing required fields (400 Bad Request)

### 2. Patient Retrieval
- ✅ Admin sees all patients
- ✅ Secondary Secretary sees only own hospital patients
- ✅ Doctor sees all patients
- ✅ Search by first name, last name, or ID number
- ✅ Empty search returns empty array

### 3. Patient Updates
- ✅ Secondary Secretary can update own hospital patients
- ✅ Admin can update any patient
- ❌ Nurse cannot update patient basic info (403 Forbidden)
- ❌ Duplicate ID number rejected (409 Conflict)

### 4. Vital Signs
- ✅ Nurse can update vital signs
- ❌ Doctor cannot update vital signs (403 Forbidden)
- ❌ Empty vital signs object rejected (400 Bad Request)
- ✅ Vital signs timestamp and nurse ID recorded

### 5. EHR Updates
- ✅ Nurse can update EHR
- ✅ Doctor can update EHR
- ✅ Secondary Secretary can update EHR
- ✅ Partial updates work correctly

### 6. Patient Deactivation
- ✅ Admin can deactivate patients
- ✅ Primary Secretary can deactivate patients
- ❌ Nurse cannot deactivate patients (403 Forbidden)
- ❌ Deactivated patients not in active list

## Expected Test Results

### Success Criteria
- All setup requests return 200 OK
- Patient creation returns 201 Created
- Patient retrieval returns 200 OK with correct data
- Role-based access control enforced correctly
- Validation errors return appropriate status codes
- Integration tests verify data consistency

### Common Issues

1. **Server Not Running**
   - Error: `ECONNREFUSED 127.0.0.1:3000`
   - Solution: Start server with `npm run start:dev`

2. **Authentication Failures**
   - Error: `401 Unauthorized`
   - Solution: Verify user credentials in database

3. **Missing Patient ID**
   - Error: Tests fail with "patientId is not set"
   - Solution: Ensure "Create Patient" tests run first

4. **Hospital ID Mismatch**
   - Error: `403 Forbidden` for Secondary Secretary
   - Solution: Verify Secondary Secretary has `hospitalId` set

5. **Duplicate ID Number**
   - Error: `409 Conflict`
   - Solution: Tests use dynamic ID numbers; if persistent, check database

## Test Data

The collection uses dynamic test data:
- **ID Numbers**: Generated using `Date.now()` to ensure uniqueness
- **Patient Names**: "Jean Kamga" (test patient)
- **Phone Numbers**: Valid format `+237655001234`
- **Dates**: ISO format `1980-05-15`

## Environment Variables

The following variables are set automatically during test execution:
- `adminToken`: Admin authentication token
- `secondarySecretaryToken`: Secondary Secretary token
- `nurseToken`: Nurse authentication token
- `doctorToken`: Doctor authentication token
- `primarySecretaryToken`: Primary Secretary token
- `patientId`: Created patient ID (used in subsequent tests)
- `testIdNumber`: Dynamic ID number for patient creation
- `secondarySecretaryHospitalId`: Hospital ID for access control tests

## API Endpoints Tested

- `POST /patients` - Create patient
- `GET /patients` - Get all patients
- `GET /patients/search?q={query}` - Search patients
- `GET /patients/:id` - Get patient by ID
- `PATCH /patients/:id` - Update patient
- `PATCH /patients/:id/vitals` - Update vital signs
- `PATCH /patients/:id/ehr` - Update EHR
- `PATCH /patients/:id/deactivate` - Deactivate patient

## Validation Rules Tested

1. **Required Fields**: firstName, lastName, dateOfBirth, idNumber, phone
2. **Phone Format**: Must match `@IsPhoneNumber()` validator
3. **Email Format**: Must be valid email if provided
4. **ID Number Uniqueness**: Must be unique across all patients
5. **Vital Signs**: Must be non-empty object
6. **EHR Fields**: Max length validation (medicalHistory: 5000, allergies: 2000, etc.)

## Security Tests

- ✅ Role-based access control enforced
- ✅ Hospital-based filtering for Secondary Secretary
- ✅ Unauthorized access returns 403 Forbidden
- ✅ Missing authentication returns 401 Unauthorized
- ✅ Patient data access restricted by role and hospital

## Notes

- Tests are designed to run sequentially (dependencies between tests)
- Patient ID is stored in environment after creation
- Some tests create additional patients for specific scenarios
- Deactivation tests verify that deactivated patients are excluded from active lists
- Integration tests verify data consistency after multiple operations

