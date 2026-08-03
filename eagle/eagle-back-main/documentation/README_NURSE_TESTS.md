
## Overview

This test collection validates all backend features implemented for the nurse workflow, including:
- Preparation workflow management
- Patient identity verification
- Nurse workflow status tracking
- Enhanced vital signs with BMI calculation and health alerts

## Test Collection Details

- **File:** `nurse-workflow-tests.json`
- **Total Tests:** 13 tests
- **Test Sections:** 3 major sections
- **Authentication:** Bearer token (Nurse role required)

## Prerequisites

### 1. Server Running
```bash
cd c:\Users\Bryan\Documents\EAGLES\eagle-back
npm run start:dev
```

### 2. Nurse User Authentication

You need a valid JWT token for a user with NURSE role. Obtain it by:

**Option A: Using existing nurse account**
```bash
POST http://localhost:3000/auth/login
{
  "email": "nurse@hospital.com",
  "password": "your_password"
}
```

**Option B: Register new nurse** (if Admin or Primary Secretary)
```bash
POST http://localhost:3000/users
{
  "email": "testnurse@hospital.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "Nurse",
  "role": "NURSE",
  "hospitalId": "your_hospital_id"
}
```

### 3. Patient Record

You need an existing patient ID. Create one or use existing:

```bash
POST http://localhost:3000/patients
{
  "firstName": "Test",
  "lastName": "Patient",
  "dateOfBirth": "1990-01-15",
  "idNumber": "TEST123456",
  "phone": "+237655001234",
  "email": "testpatient@example.com"
}
```

## Running the Tests

### Method 1: Postman GUI (Recommended)

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `nurse-workflow-tests.json`

2. **Set Collection Variables**
   - Click on the collection
   - Go to "Variables" tab
   - Set the following:
     - `baseUrl`: `http://localhost:3000`
     - `nurseToken`: `your_jwt_token_here`
     - `patientId`: `your_patient_id_here`

3. **Run Tests**
   - Click "Run" on the collection
   - Select all tests or specific sections
   - Click "Run Nurse Workflow Tests"
   - View results

### Method 2: Newman CLI (Automated)

1. **Install Newman**
```bash
npm install -g newman
```

2. **Run Collection**
```bash
newman run nurse-workflow-tests.json \
  --env-var "baseUrl=http://localhost:3000" \
  --env-var "nurseToken=YOUR_TOKEN_HERE" \
  --env-var "patientId=YOUR_PATIENT_ID"
```

3. **Run with HTML Report**
```bash
newman run nurse-workflow-tests.json \
  --env-var "baseUrl=http://localhost:3000" \
  --env-var "nurseToken=YOUR_TOKEN_HERE" \
  --env-var "patientId=YOUR_PATIENT_ID" \
  --reporters cli,html \
  --reporter-html-export nurse-workflow-test-results.html
```

## Test Sections

### 1. Preparations Module (7 tests)

Tests the complete preparation workflow:

| Test | Endpoint | Expected Result |
|------|----------|-----------------|
| Create Preparation | POST `/preparations` | Status 201, preparation created |
| Update Progress | PATCH `/preparations/:id/progress` | Status 200, progress updated |
| Add Observations | PATCH `/preparations/:id/observations` | Status 200, observations added |
| Update Checklist | PATCH `/preparations/:id/checklist` | Status 200, checklist updated |
| Progress to 80% | PATCH `/preparations/:id/progress` | Status 200, auto-status to READY |
| Complete Preparation | PATCH `/preparations/:id/complete` | Status 200, status COMPLETED |
| Get Active | GET `/preparations/active` | Status 200, returns array |

### 2. Identity Verification (3 tests)

Tests patient identity verification and workflow tracking:

| Test | Endpoint | Expected Result |
|------|----------|-----------------|
| Verify Identity | PATCH `/patients/:id/verify-identity` | Status 200, identity verified |
| Update to WAITING | PATCH `/patients/:id/workflow-status` | Status 200, status WAITING |
| Update to PREPARATION | PATCH `/patients/:id/workflow-status` | Status 200, nurse assigned |

### 3. Enhanced Vitals (3 tests)

Tests BMI calculation and health alerts:

| Test | Endpoint | Expected Result |
|------|----------|-----------------|
| BMI Calculation | PATCH `/patients/:id/vitals-enhanced` | Status 200, BMI calculated |
| Hypertension Alert | PATCH `/patients/:id/vitals-enhanced` | Status 200, hypertension detected |
| Multiple Alerts | PATCH `/patients/:id/vitals-enhanced` | Status 200, multiple alerts |

## Expected Results

### All Tests Passing

```
Nurse Workflow Tests
  ├─ 1. Preparations Module
  │  ├─ Create Preparation ✓
  │  ├─ Update Preparation Progress ✓
  │  ├─ Add Observations ✓
  │  ├─ Update Technical Checklist ✓
  │  ├─ Update Progress to 80% (Ready) ✓
  │  ├─ Complete Preparation ✓
  │  └─ Get Active Preparations ✓
  │
  ├─ 2. Identity Verification
  │  ├─ Verify Patient Identity ✓
  │  ├─ Update Workflow Status to WAITING ✓
  │  └─ Update Workflow Status to PREPARATION ✓
  │
  └─ 3. Enhanced Vitals with BMI & Alerts
     ├─ Update Vitals with BMI Calculation ✓
     ├─ Test Hypertension Alert ✓
     └─ Test Multiple Alerts ✓

Total: 13 tests passing
```

### Sample Alert Output

When testing enhanced vitals, you should see alerts like:

```json
{
  "patient": { /* ... */ },
  "processedVitals": {
    "bloodPressureSystolic": 185,
    "bloodPressureDiastolic": 115,
    "heartRate": 125,
    "temperature": 38.5,
    "oxygenSaturation": 88,
    "weight": 95,
    "height": 170,
    "respiratoryRate": 25,
    "glycemia": 1.5,
    "bmi": 32.9,
    "alerts": [
      {
        "type": "HYPERTENSION_CRISIS",
        "severity": "CRITICAL",
        "message": "Hypertensive Crisis (185/115 mmHg) - Immediate medical attention required!"
      },
      {
        "type": "TACHYCARDIA",
        "severity": "WARNING",
        "message": "Elevated Heart Rate (125 bpm)"
      },
      {
        "type": "FEVER",
        "severity": "INFO",
        "message": "Fever (38.5°C)"
      },
      {
        "type": "HYPOXEMIA",
        "severity": "WARNING",
        "message": "Low Oxygen Saturation (88%)"
      },
      {
        "type": "OBESITY",
        "severity": "WARNING",
        "message": "BMI 32.9 - Obese"
      },
      {
        "type": "TACHYPNEA",
        "severity": "WARNING",
        "message": "Elevated Respiratory Rate (25/min)"
      },
      {
        "type": "HYPERGLYCEMIA",
        "severity": "INFO",
        "message": "High Blood Sugar (1.5 g/L)"
      }
    ]
  }
}
```

## Troubleshooting

### Issue: "Authentication failed"
**Solution:** Make sure your `nurseToken` is valid and not expired. Re-login if needed.

### Issue: "Patient not found"
**Solution:** Verify the `patientId` exists in your database. Create a test patient if needed.

### Issue: "Only nurses can..."
**Solution:** Ensure your token is for a user with role NURSE, not DOCTOR or other role.

### Issue: "Preparation not found"
**Solution:** The tests must be run in sequence. The first test creates a preparation and stores its ID. If you run tests individually, set `preparationId` manually.

### Issue: "Progress must be at least 80%"
**Solution:** Run tests in order. The "Complete Preparation" test requires progress ≥80%, which is set in previous tests.

## Manual Testing Examples

### Create Preparation

```bash
curl -X POST http://localhost:3000/preparations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID"
  }'
```

### Update Vitals with Alerts

```bash
curl -X PATCH http://localhost:3000/patients/PATIENT_ID/vitals-enhanced \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vitalSigns": {
      "bloodPressureSystolic": 165,
      "bloodPressureDiastolic": 95,
      "heartRate": 95,
      "temperature": 37.2,
      "oxygenSaturation": 98,
      "weight": 78,
      "height": 172,
      "respiratoryRate": 18,
      "glycemia": 1.0
    }
  }'
```

### Verify Identity

```bash
curl -X PATCH http://localhost:3000/patients/PATIENT_ID/verify-identity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identityDocumentType": "CNI",
    "identityDocumentUrl": "https://storage.googleapis.com/test-cni.jpg",
    "photoUrl": "https://storage.googleapis.com/test-photo.jpg"
  }'
```

## Notes

1. **Test Order:** Tests are designed to run sequentially. Some tests depend on previous test results (e.g., preparationId).

2. **Data Persistence:** Tests create real data in your database. Clean up test data periodically.

3. **Token Expiration:** JWT tokens expire. If tests fail with 401, refresh your token.

4. **Hospital Scoping:** Nurses can only access patients from their assigned hospital.

5. **Alerts Logic:** The vitals processing service uses medically-accurate thresholds. Alerts are educational and should be reviewed by medical professionals.

## Additional Resources

- **API Documentation:** http://localhost:3000/api (Swagger UI)
- **Implementation Details:** `../documentation/Nurse_solved_functionality.md`
- **Workflow Analysis:** `../../doc/NURSE_WORKFLOW_ANALYSIS.md`

## Support

For issues or questions:
1. Check the main documentation: `documentation/Nurse_solved_functionality.md`
2. Review API docs at `/api` endpoint
3. Check server logs for detailed error messages
4. Verify all prerequisites are met

---

**Test Collection Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Ready for testing
