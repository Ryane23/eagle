# Patient Module Update - Testing Guide

## Overview

This guide covers testing for the enhanced Patient module with **Vital Signs Tracking** and **Electronic Health Records (EHR) Management**.

## Module Components

### 📋 Entity Updates (`src/modules/patients/entities/patient.entity.ts`)

**New Fields Added:**
- `vitalSigns` (Record<string, any>) - Stores vital signs data (e.g., BP, HR, temperature)
- `vitalSignsUpdatedAt` (Date) - Timestamp of last vital signs update
- `vitalSignsUpdatedBy` (string) - Nurse user ID who updated vital signs
- `medicalHistory` (string) - ENCRYPTED medical history
- `allergies` (string) - ENCRYPTED allergies information
- `currentMedications` (string) - ENCRYPTED current medications
- `bloodType` (string) - Patient blood type

### 🔧 New Endpoints

#### 1. Update Vital Signs
- **Endpoint**: `PATCH /patients/:id/vitals`
- **Access**: `NURSE` only
- **DTO**: `UpdateVitalsDto`
- **Body**: 
  ```json
  {
    "vitalSigns": {
      "bp": "120/80",
      "hr": 72,
      "temp": "98.6",
      "spo2": 98,
      "weight": 70,
      "height": 175
    }
  }
  ```

#### 2. Update EHR
- **Endpoint**: `PATCH /patients/:id/ehr`
- **Access**: `NURSE`, `DOCTOR`, `SECONDARY_SECRETARY` (own hospital)
- **DTO**: `UpdateEhrDto`
- **Body**:
  ```json
  {
    "medicalHistory": "Patient has history of hypertension...",
    "allergies": "Penicillin, Sulfa drugs",
    "currentMedications": "Metformin 500mg twice daily...",
    "bloodType": "O+"
  }
  ```

---

## Prerequisites

1. **Server Running**: `npm run start:dev`
2. **Database Seeded**: `npm run seed:all`
3. **Newman Installed**: `npm install -g newman` (for automated testing)

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Secondary Secretary | secretary.douala@eagles.com | Douala@123 |
| Nurse | nurse.douala@eagles.com | Nurse@123 |
| Doctor | doctor.nana@eagles.com | Doctor@123 |
| Admin | admin@eagles.com | Admin@123456 |

---

## Test Scenarios

### ✅ Vital Signs Tests

#### 1. **Update Vital Signs - Nurse (Success)**
- **Role**: NURSE
- **Expected**: 200 OK
- **Verification**:
  - `vitalSigns` field updated
  - `vitalSignsUpdatedAt` timestamp set
  - `vitalSignsUpdatedBy` matches nurse ID

#### 2. **Update Vital Signs - Doctor (Forbidden)**
- **Role**: DOCTOR
- **Expected**: 403 Forbidden
- **Error Message**: "Only nurses can update vital signs"

#### 3. **Update Vital Signs - Secondary Secretary (Forbidden)**
- **Role**: SECONDARY_SECRETARY
- **Expected**: 403 Forbidden

#### 4. **Update Vital Signs - Invalid Patient ID**
- **Role**: NURSE
- **Patient ID**: "invalid-patient-id"
- **Expected**: 404 Not Found

#### 5. **Update Vital Signs - Validation Error**
- **Role**: NURSE
- **Body**: Empty `vitalSigns` object `{}`
- **Expected**: 400 Bad Request

#### 6. **Get Patient - Verify Vital Signs**
- **Role**: NURSE
- **Expected**: 200 OK
- **Verification**: Patient object contains `vitalSigns`, `vitalSignsUpdatedAt`, `vitalSignsUpdatedBy`

---

### ✅ EHR Tests

#### 1. **Update EHR - Nurse (Success)**
- **Role**: NURSE
- **Expected**: 200 OK
- **Verification**: All EHR fields updated

#### 2. **Update EHR - Doctor (Success)**
- **Role**: DOCTOR
- **Expected**: 200 OK
- **Verification**: EHR fields updated

#### 3. **Update EHR - Secondary Secretary (Success)**
- **Role**: SECONDARY_SECRETARY
- **Expected**: 200 OK
- **Verification**: EHR fields updated

#### 4. **Update EHR - Admin (Forbidden)**
- **Role**: ADMIN
- **Expected**: 403 Forbidden

#### 5. **Update EHR - Partial Update**
- **Role**: DOCTOR
- **Body**: Only `medicalHistory` field
- **Expected**: 200 OK
- **Verification**: Only specified field updated, others remain unchanged

#### 6. **Update EHR - Validation Error (Max Length)**
- **Role**: NURSE
- **Body**: `medicalHistory` > 5000 characters
- **Expected**: 400 Bad Request

#### 7. **Get Patient - Verify EHR Data**
- **Role**: DOCTOR
- **Expected**: 200 OK
- **Verification**: Patient object contains all EHR fields

---

### ✅ Integration Tests

#### 1. **Update Vital Signs Then EHR**
- **Steps**:
  1. Update vital signs (NURSE)
  2. Update EHR (DOCTOR)
  3. Get patient
- **Expected**: Both `vitalSigns` and EHR fields present

#### 2. **Verify Updated Timestamps**
- **Expected**: `updatedAt` timestamp reflects recent updates

---

## Running Tests

### Automated Testing (Recommended)

```powershell
# Run the PowerShell test script
.\test-patient-module-update.ps1
```

This script will:
1. Check if Newman is installed
2. Verify server is running
3. Run the Postman collection
4. Display test results

### Manual Testing with Postman

1. **Import Collection**:
   - Import `EAGLES_Patient_Module_Update_Postman_Collection.json`
   - Import `EAGLES_Local.postman_environment.json`

2. **Run Collection**:
   - Select the collection
   - Click "Run"
   - Review test results

### Manual Testing with cURL

#### Update Vital Signs (Nurse)
```bash
curl -X PATCH http://localhost:3000/patients/{patientId}/vitals \
  -H "Authorization: Bearer {nurseToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "vitalSigns": {
      "bp": "120/80",
      "hr": 72,
      "temp": "98.6"
    }
  }'
```

#### Update EHR (Doctor)
```bash
curl -X PATCH http://localhost:3000/patients/{patientId}/ehr \
  -H "Authorization: Bearer {doctorToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "medicalHistory": "Patient history...",
    "allergies": "Penicillin",
    "currentMedications": "Metformin 500mg",
    "bloodType": "O+"
  }'
```

---

## Expected Test Results

### ✅ Success Criteria

- **Vital Signs**: Only NURSE can update, metadata tracked correctly
- **EHR**: NURSE, DOCTOR, SECONDARY_SECRETARY can update
- **Access Control**: Other roles receive 403 Forbidden
- **Validation**: Invalid data returns 400 Bad Request
- **Data Integrity**: Updates persist correctly, timestamps accurate

### 📊 Test Coverage

- **Total Requests**: 18
- **Test Categories**:
  - Setup (5 requests)
  - Vital Signs Tests (6 requests)
  - EHR Tests (7 requests)
  - Integration Tests (2 requests)

---

## Troubleshooting

### Issue: "Only nurses can update vital signs" (403)
**Solution**: Ensure you're using a NURSE token, not DOCTOR or other role.

### Issue: "Patient with ID {id} not found" (404)
**Solution**: Verify patient exists and `patientId` is correct. Check hospital access control.

### Issue: Validation errors (400)
**Solution**: 
- Ensure `vitalSigns` is a non-empty object
- Check field length limits (medicalHistory: 5000, allergies: 2000, etc.)
- Verify all required fields are present

### Issue: "You do not have permission to view this patient" (403)
**Solution**: Ensure user's `hospitalId` matches patient's `hospitalId` for NURSE/DOCTOR roles.

---

## Security Considerations

1. **Encryption**: EHR fields (`medicalHistory`, `allergies`, `currentMedications`) should be encrypted at rest (AES-256)
2. **Access Control**: Role-based access strictly enforced
3. **Audit Trail**: `vitalSignsUpdatedBy` and `vitalSignsUpdatedAt` provide audit trail
4. **Hospital Isolation**: Users can only access patients from their own hospital

---

## Related Documentation

- [Patient Entity](../src/modules/patients/entities/patient.entity.ts)
- [Patients Controller](../src/modules/patients/patients.controller.ts)
- [Patients Service](../src/modules/patients/patients.service.ts)
- [Update Vitals DTO](../src/modules/patients/dto/update-vitals.dto.ts)
- [Update EHR DTO](../src/modules/patients/dto/update-ehr.dto.ts)

---

**Last Updated**: 2025-01-XX
**Test Suite Version**: 1.0.0

