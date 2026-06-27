# Urgency and Patient Management Implementation

This document summarizes the implementation of the two critical management systems in the EAGLES backend.

## ✅ Urgency Management - FULLY IMPLEMENTED

### Overview
The Urgency Management system is the core workflow that takes a patient's request for care and turns it into a scheduled, validated teleconsultation through a state machine process.

### State Machine Workflow
```
PENDING → VALIDATED_PRIMARY_SECRETARY → APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED
                                                                    ↓
                                                               REJECTED (terminal)
```

### Entity Structure
**Location:** `src/modules/urgencies/entities/urgency.entity.ts`

**Fields:**
- `id`: string
- `patientId`: string (Required - Reference to patients)
- `hospitalId`: string (Required - Reference to hospitals)
- `createdBy`: string (Required - SECONDARY_SECRETARY user ID)
- `status`: UrgencyStatus enum (Required)
- `level`: UrgencyLevel enum (Required - LOW, MODERATE, URGENT, CRITICAL)
- `reasonForConsultation`: string (Required)
- `requestedSpecialty`: string (Required)
- `symptoms`: string (Optional)
- `vitalSigns`: Record<string, any> (Optional)
- `documentUrls`: string[] (Optional)
- `primaryValidation`: PrimaryValidation object (Added by PRIMARY_SECRETARY)
- `assignedDoctorId`: string (Optional - Added when assigned)
- `scheduledAt`: Date (Optional - Added when assigned)
- `createdAt`: Date
- `updatedAt`: Date

### API Endpoints

**Location:** `src/modules/urgencies/urgencies.controller.ts`

1. **POST /urgencies** - Create urgency request
   - Access: `SECONDARY_SECRETARY` only
   - Auto-sets: `status = PENDING`, `createdBy`, `hospitalId`

2. **GET /urgencies/pending** - Get pending urgencies
   - Access: `PRIMARY_SECRETARY` only
   - Returns all urgencies with status `PENDING`

3. **GET /urgencies** - Get all urgencies with filters
   - Query params: `status`, `hospitalId`
   - Access control:
     - `DOCTOR`: Sees only assigned cases (APPROVED, ASSIGNED, IN_PROGRESS)
     - `SECONDARY_SECRETARY`: Sees active cases for their hospital
     - `ADMIN`/`PRIMARY_SECRETARY`: Can see all with filters

4. **GET /urgencies/:id** - Get urgency by ID
   - Access: Based on role and hospital association

5. **PATCH /urgencies/:id/validate** - Validate urgency
   - Access: `PRIMARY_SECRETARY` only
   - Changes status to `VALIDATED_PRIMARY_SECRETARY`
   - Requires: `newLevel`, `justification`
   - Stores validation details in `primaryValidation` object

6. **PATCH /urgencies/:id/assign** - Assign doctor
   - Access: `PRIMARY_SECRETARY` only
   - Changes status to `ASSIGNED`
   - Requires: `assignedDoctorId`, `scheduledAt`
   - Automatically creates a consultation document

7. **PATCH /urgencies/:id/reject** - Reject urgency
   - Access: `PRIMARY_SECRETARY` or `DOCTOR`
   - Changes status to `REJECTED`

8. **PATCH /urgencies/:id/start** - Start consultation
   - Access: `DOCTOR` only
   - Changes status to `IN_PROGRESS`

9. **PATCH /urgencies/:id/complete** - Complete urgency
   - Access: `DOCTOR` only
   - Changes status to `COMPLETED`

### Multi-Level Validation

1. **Level 1 (Creation)**: `SECONDARY_SECRETARY` creates request with initial urgency level
2. **Level 2 (Validation)**: `PRIMARY_SECRETARY` reviews and can confirm or escalate level (must provide justification)
3. **Level 3 (Assignment)**: `PRIMARY_SECRETARY` assigns to available specialist doctor

### State Machine Validation
All state transitions are validated to ensure proper workflow:
- Can only validate from `PENDING`
- Can only assign from `VALIDATED_PRIMARY_SECRETARY` or `APPROVED`
- Can only start from `ASSIGNED`
- Can only complete from `IN_PROGRESS`
- Can reject from any non-terminal state

### Integration
- **Patient Module**: Linked via `patientId`
- **User Module**: Linked via `createdBy` and `assignedDoctorId`
- **Hospital Module**: Linked via `hospitalId`
- **Consultation Module**: Automatically creates consultation when urgency is assigned

---

## ✅ Patient Management - FULLY IMPLEMENTED

### Overview
Patient Management stores and manages all demographic and contact information for individuals seeking care. Patients are only registered at Secondary Centers by Secondary Secretaries.

### Entity Structure
**Location:** `src/modules/patients/entities/patient.entity.ts`

**Required Fields:**
- `firstName`: string
- `lastName`: string
- `dateOfBirth`: Date
- `idNumber`: string (Must be unique - government-issued ID)
- `phone`: string
- `hospitalId`: string (Required - Secondary Center where registered)
- `isActive`: boolean (Defaults to true)

**Optional Fields:**
- `email`: string
- `address`: string
- `emergencyContactName`: string
- `emergencyContactPhone`: string

### API Endpoints

**Location:** `src/modules/patients/patients.controller.ts`

1. **POST /patients** - Create patient
   - Access: `SECONDARY_SECRETARY` only
   - Auto-assigns `hospitalId` from logged-in user
   - Validates `idNumber` uniqueness

2. **GET /patients** - Get all patients
   - Access control:
     - `SECONDARY_SECRETARY`: Only patients from their hospital
     - `ADMIN`, `PRIMARY_SECRETARY`, `DOCTOR`: All patients

3. **GET /patients/search?q=query** - Search patients
   - Searches by name (first/last) or ID number
   - Same access control as GET /patients
   - `SECONDARY_SECRETARY` can only search within their hospital

4. **GET /patients/:id** - Get patient by ID
   - Access control:
     - `SECONDARY_SECRETARY`, `NURSE`, `DOCTOR`: If patient is from their hospital
     - `ADMIN`, `PRIMARY_SECRETARY`: Any patient

5. **PATCH /patients/:id** - Update patient
   - Access: `SECONDARY_SECRETARY` (own hospital) or `ADMIN`
   - Validates `idNumber` uniqueness if being updated

6. **PATCH /patients/:id/deactivate** - Deactivate patient
   - Access: `ADMIN` or `PRIMARY_SECRETARY` only
   - Soft delete (sets `isActive = false`)

### Uniqueness Constraint
- `idNumber` must be unique across all patients
- Backend validates uniqueness before creating/updating
- Returns `409 Conflict` if duplicate `idNumber` is found

### Access Control Rules

**SECONDARY_SECRETARY:**
- Can create patients (auto-assigned to their hospital)
- Can view/search only patients from their hospital
- Can update patients from their hospital

**ADMIN:**
- Full access to all patients
- Can view, update, and deactivate any patient

**PRIMARY_SECRETARY:**
- Can view all patients
- Can deactivate patients

**DOCTOR:**
- Can view all patients
- Can view patients assigned to them for consultations

**NURSE:**
- Can view patients from their hospital

### Integration
- **Hospital Module**: Linked via `hospitalId` (permanent link to Secondary Center)
- **Urgency Module**: Urgencies link to patients via `patientId`
- **Consultation Module**: Consultations link to patients via `patientId`

---

## 📋 Module Registration

Both modules are registered in `src/app.module.ts`:
- `UrgenciesModule`
- `PatientsModule`

---

## 🔒 Security

All endpoints are protected with:
- `JwtAuthGuard` - Requires valid JWT token
- `RolesGuard` - Role-based access control
- Hospital-based filtering for `SECONDARY_SECRETARY` and `NURSE`

---

## 🚀 Usage Examples

### Urgency Management

```bash
# Create urgency (SECONDARY_SECRETARY)
POST /urgencies
{
  "patientId": "patient-id",
  "level": "URGENT",
  "reasonForConsultation": "Chest pain for 2 days",
  "requestedSpecialty": "Cardiology",
  "symptoms": "Sharp chest pain, shortness of breath",
  "vitalSigns": { "bp": "165/95", "hr": 95 }
}

# Validate urgency (PRIMARY_SECRETARY)
PATCH /urgencies/:id/validate
{
  "newLevel": "CRITICAL",
  "justification": "Patient shows signs of cardiac event, escalating to critical"
}

# Assign doctor (PRIMARY_SECRETARY)
PATCH /urgencies/:id/assign
{
  "assignedDoctorId": "doctor-id",
  "scheduledAt": "2024-01-20T10:00:00Z"
}
```

### Patient Management

```bash
# Create patient (SECONDARY_SECRETARY)
POST /patients
{
  "firstName": "Kamga",
  "lastName": "Jean",
  "dateOfBirth": "1980-05-15",
  "idNumber": "123456789012345",
  "phone": "+237 699 123 456",
  "email": "kamga.jean@email.com",
  "address": "456 Market Avenue, Douala",
  "emergencyContactName": "Marie Kamga",
  "emergencyContactPhone": "+237 699 987 654"
}

# Search patients
GET /patients/search?q=Kamga

# Get patient by ID
GET /patients/:id
```

---

## ✅ All Requirements Met

### Urgency Management
- ✅ State machine workflow (PENDING → VALIDATED → APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED)
- ✅ Multi-level validation (SECONDARY_SECRETARY → PRIMARY_SECRETARY → Assignment)
- ✅ Urgency levels (LOW, MODERATE, URGENT, CRITICAL)
- ✅ All required fields (hospitalId, createdBy, reasonForConsultation, requestedSpecialty, etc.)
- ✅ Primary validation object with justification
- ✅ Assignment with doctor and scheduled time
- ✅ Rejection capability
- ✅ Automatic consultation creation on assignment
- ✅ Role-based access control

### Patient Management
- ✅ Required fields (firstName, lastName, dateOfBirth, idNumber, phone, hospitalId)
- ✅ Optional fields (email, address, emergency contacts)
- ✅ Uniqueness constraint on idNumber
- ✅ Registration only at Secondary Centers
- ✅ Permanent hospital association
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Role-based access control
- ✅ Hospital-based filtering

Both systems are fully implemented, tested for linting errors, and ready to use!

