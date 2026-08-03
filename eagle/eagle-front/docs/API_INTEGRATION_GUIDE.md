# EAGLE API Integration Guide

> Complete guide for integrating the EAGLE frontend with the NestJS backend API.

**Base URL:** `http://localhost:3000` (Development)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users Management](#2-users-management)
3. [Hospitals Management](#3-hospitals-management)
4. [Patients Management](#4-patients-management)
5. [Urgencies Management](#5-urgencies-management)
6. [Consultations Management](#6-consultations-management)
7. [Queue Management](#7-queue-management)
8. [Prescriptions Management](#8-prescriptions-management)
9. [Files Management](#9-files-management)
10. [Notifications](#10-notifications)
11. [Reports & Complaints](#11-reports--complaints)
12. [Analytics](#12-analytics)
13. [System Settings](#13-system-settings)
14. [WebRTC Integration](#14-webrtc-integration)

---

## Prerequisites

### Environment Setup

```typescript
// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = {
  baseUrl: API_BASE_URL,
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  },
};
```

### Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eagles.com | Admin@123456 |
| Primary Secretary | secretary.primary@eagles.com | Primary@123 |
| Secondary Secretary | secretary.douala@eagles.com | Douala@123 |
| Nurse | nurse.douala@eagles.com | Nurse@123 |
| Doctor | doctor.nana@eagles.com | Doctor@123 |

---

## 1. Authentication

### 1.1 Login

**Endpoint:** `POST /auth/login`  
**Access:** Public

```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'primary_secretary' | 'secondary_secretary' | 'doctor' | 'nurse';
    hospitalId?: string;
    specialtyId?: string;
    isActive: boolean;
  };
  expiresIn: number; // seconds
}

// Implementation
async function login(email: string, password: string): Promise<AuthResponse> {
  return apiClient.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

### 1.2 Register User (Admin Only)

**Endpoint:** `POST /auth/register`  
**Access:** Admin only

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'primary_secretary' | 'secondary_secretary' | 'doctor' | 'nurse';
  hospitalId?: string;  // Required for secretary, nurse
  specialtyId?: string; // Required for doctor
  phone?: string;
}

async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 1.3 Get Current User Profile

**Endpoint:** `GET /auth/me`  
**Access:** Authenticated users

```typescript
async function getCurrentUser(): Promise<User> {
  return apiClient.request('/auth/me');
}
```

### 1.4 Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Access:** Public (with valid refresh token)

```typescript
interface RefreshRequest {
  refreshToken: string;
}

async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return apiClient.request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
```

### 1.5 Logout

**Endpoint:** `POST /auth/logout`  
**Access:** Authenticated users

```typescript
async function logout(refreshToken: string): Promise<{ message: string }> {
  return apiClient.request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
```

---

## 2. Users Management

### 2.1 Get All Users

**Endpoint:** `GET /users`  
**Access:** Admin only  
**Query Params:** `role`, `hospitalId`, `isActive`

```typescript
interface UsersQueryParams {
  role?: string;
  hospitalId?: string;
  isActive?: boolean;
}

async function getUsers(params?: UsersQueryParams): Promise<User[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiClient.request(`/users${query ? `?${query}` : ''}`);
}
```

### 2.2 Get User by ID

**Endpoint:** `GET /users/:id`  
**Access:** Admin only

```typescript
async function getUserById(id: string): Promise<User> {
  return apiClient.request(`/users/${id}`);
}
```

### 2.3 Update User

**Endpoint:** `PATCH /users/:id`  
**Access:** Admin only

```typescript
interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: string;
  hospitalId?: string;
  specialtyId?: string;
}

async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  return apiClient.request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 2.4 Activate/Deactivate User

**Endpoints:**
- `PATCH /users/:id/activate`
- `PATCH /users/:id/deactivate`

**Access:** Admin only

```typescript
async function activateUser(id: string): Promise<User> {
  return apiClient.request(`/users/${id}/activate`, { method: 'PATCH' });
}

async function deactivateUser(id: string): Promise<User> {
  return apiClient.request(`/users/${id}/deactivate`, { method: 'PATCH' });
}
```

### 2.5 Delete User

**Endpoint:** `DELETE /users/:id`  
**Access:** Admin only

```typescript
async function deleteUser(id: string): Promise<void> {
  return apiClient.request(`/users/${id}`, { method: 'DELETE' });
}
```

---

## 3. Hospitals Management

### 3.1 Create Hospital

**Endpoint:** `POST /hospitals`  
**Access:** Admin only

```typescript
interface CreateHospitalRequest {
  name: string;
  type: 'PRIMARY' | 'SECONDARY';
  address: string;
  city: string;
  country: string;
  contactPhone: string;
  contactEmail: string;
  code?: string;
  capacity?: number;
}

async function createHospital(data: CreateHospitalRequest): Promise<Hospital> {
  return apiClient.request('/hospitals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

> **Note:** Only ONE PRIMARY center can exist. Creating a second PRIMARY will return 409 Conflict.

### 3.2 Get All Hospitals

**Endpoint:** `GET /hospitals`  
**Access:** Admin, Primary Secretary, Doctor

```typescript
async function getHospitals(): Promise<Hospital[]> {
  return apiClient.request('/hospitals');
}
```

### 3.3 Get Hospital by ID

**Endpoint:** `GET /hospitals/:id`  
**Access:** Admin, Primary Secretary, Doctor

```typescript
async function getHospitalById(id: string): Promise<Hospital> {
  return apiClient.request(`/hospitals/${id}`);
}
```

### 3.4 Get Hospitals by Type

**Endpoint:** `GET /hospitals/type/:type`  
**Access:** Admin, Primary Secretary, Doctor

```typescript
async function getHospitalsByType(type: 'PRIMARY' | 'SECONDARY'): Promise<Hospital[]> {
  return apiClient.request(`/hospitals/type/${type}`);
}
```

### 3.5 Get Primary Center

**Endpoint:** `GET /hospitals/primary/center`  
**Access:** Admin, Primary Secretary, Doctor

```typescript
async function getPrimaryCenter(): Promise<Hospital> {
  return apiClient.request('/hospitals/primary/center');
}
```

### 3.6 Update Hospital

**Endpoint:** `PATCH /hospitals/:id`  
**Access:** Admin only

```typescript
interface UpdateHospitalRequest {
  name?: string;
  address?: string;
  city?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacity?: number;
}

async function updateHospital(id: string, data: UpdateHospitalRequest): Promise<Hospital> {
  return apiClient.request(`/hospitals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 3.7 Activate/Deactivate Hospital

**Endpoints:**
- `PATCH /hospitals/:id/activate`
- `PATCH /hospitals/:id/deactivate`

**Access:** Admin only

> **Note:** Cannot deactivate the PRIMARY center.

### 3.8 Delete Hospital

**Endpoint:** `DELETE /hospitals/:id`  
**Access:** Admin only

> **Note:** Cannot delete the PRIMARY center.

---

## 4. Patients Management

### 4.1 Create Patient

**Endpoint:** `POST /patients`  
**Access:** Secondary Secretary only

```typescript
interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date: "1980-05-15"
  idNumber: string;    // Must be unique
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

async function createPatient(data: CreatePatientRequest): Promise<Patient> {
  return apiClient.request('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

> **Note:** `hospitalId` is automatically set from logged-in user.

### 4.2 Get All Patients

**Endpoint:** `GET /patients`  
**Access:** Role-based filtering
- Secondary Secretary: Only their hospital
- Admin, Primary Secretary, Doctor: All patients

```typescript
async function getPatients(): Promise<Patient[]> {
  return apiClient.request('/patients');
}
```

### 4.3 Search Patients

**Endpoint:** `GET /patients/search?q={query}`  
**Access:** Same as Get All Patients

```typescript
async function searchPatients(query: string): Promise<Patient[]> {
  return apiClient.request(`/patients/search?q=${encodeURIComponent(query)}`);
}
```

### 4.4 Get Patient by ID

**Endpoint:** `GET /patients/:id`  
**Access:** Role-based (hospital filtering for some roles)

```typescript
async function getPatientById(id: string): Promise<Patient> {
  return apiClient.request(`/patients/${id}`);
}
```

### 4.5 Update Patient

**Endpoint:** `PATCH /patients/:id`  
**Access:** Secondary Secretary (own hospital) or Admin

```typescript
async function updatePatient(id: string, data: Partial<CreatePatientRequest>): Promise<Patient> {
  return apiClient.request(`/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 4.6 Update Vital Signs

**Endpoint:** `PATCH /patients/:id/vitals`  
**Access:** Nurse only

```typescript
interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  notes?: string;
}

async function updatePatientVitals(id: string, vitals: VitalSigns): Promise<Patient> {
  return apiClient.request(`/patients/${id}/vitals`, {
    method: 'PATCH',
    body: JSON.stringify(vitals),
  });
}
```

### 4.7 Update EHR (Electronic Health Records)

**Endpoint:** `PATCH /patients/:id/ehr`  
**Access:** Nurse, Doctor, Secondary Secretary

```typescript
interface EHRUpdate {
  medicalHistory?: string;   // Max 5000 chars
  allergies?: string;        // Max 2000 chars
  currentMedications?: string;
  bloodType?: string;
}

async function updatePatientEHR(id: string, ehr: EHRUpdate): Promise<Patient> {
  return apiClient.request(`/patients/${id}/ehr`, {
    method: 'PATCH',
    body: JSON.stringify(ehr),
  });
}
```

### 4.8 Deactivate Patient

**Endpoint:** `PATCH /patients/:id/deactivate`  
**Access:** Admin or Primary Secretary

```typescript
async function deactivatePatient(id: string): Promise<Patient> {
  return apiClient.request(`/patients/${id}/deactivate`, { method: 'PATCH' });
}
```

---

## 5. Urgencies Management

### State Machine Workflow

```
PENDING → VALIDATED_PRIMARY_SECRETARY → APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED
                                                                    ↓
                                                               REJECTED
```

### 5.1 Create Urgency

**Endpoint:** `POST /urgencies`  
**Access:** Secondary Secretary only

```typescript
interface CreateUrgencyRequest {
  patientId: string;
  level: 'LOW' | 'MODERATE' | 'URGENT' | 'CRITICAL';
  reasonForConsultation: string;
  requestedSpecialty: string;
  symptoms?: string;
  vitalSigns?: Record<string, any>;
  documentUrls?: string[];
}

async function createUrgency(data: CreateUrgencyRequest): Promise<Urgency> {
  return apiClient.request('/urgencies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

> **Note:** `hospitalId` and `createdBy` are automatically set from logged-in user.

### 5.2 Get Pending Urgencies

**Endpoint:** `GET /urgencies/pending`  
**Access:** Primary Secretary only

```typescript
async function getPendingUrgencies(): Promise<Urgency[]> {
  return apiClient.request('/urgencies/pending');
}
```

### 5.3 Get All Urgencies

**Endpoint:** `GET /urgencies?status={status}&hospitalId={hospitalId}`  
**Access:** Role-based filtering
- Doctor: Only assigned cases (APPROVED, ASSIGNED, IN_PROGRESS)
- Secondary Secretary: Active cases for their hospital
- Admin/Primary Secretary: All with filters

```typescript
interface UrgenciesQueryParams {
  status?: string;
  hospitalId?: string;
}

async function getUrgencies(params?: UrgenciesQueryParams): Promise<Urgency[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiClient.request(`/urgencies${query ? `?${query}` : ''}`);
}
```

### 5.4 Get Urgency by ID

**Endpoint:** `GET /urgencies/:id`  
**Access:** Role and hospital-based

```typescript
async function getUrgencyById(id: string): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}`);
}
```

### 5.5 Validate Urgency

**Endpoint:** `PATCH /urgencies/:id/validate`  
**Access:** Primary Secretary only

```typescript
interface ValidateUrgencyRequest {
  newLevel: 'LOW' | 'MODERATE' | 'URGENT' | 'CRITICAL';
  justification: string;
}

async function validateUrgency(id: string, data: ValidateUrgencyRequest): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/validate`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 5.6 Assign Doctor

**Endpoint:** `PATCH /urgencies/:id/assign`  
**Access:** Primary Secretary only

```typescript
interface AssignDoctorRequest {
  assignedDoctorId: string;
  scheduledAt: string; // ISO date-time
}

async function assignDoctor(id: string, data: AssignDoctorRequest): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

> **Note:** This automatically creates a Consultation and adds patient to Queue.

### 5.7 Reject Urgency

**Endpoint:** `PATCH /urgencies/:id/reject`  
**Access:** Primary Secretary or Doctor

```typescript
async function rejectUrgency(id: string): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/reject`, { method: 'PATCH' });
}
```

### 5.8 Start Consultation (from Urgency)

**Endpoint:** `PATCH /urgencies/:id/start`  
**Access:** Doctor only (assigned doctor)

```typescript
async function startUrgencyConsultation(id: string): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/start`, { method: 'PATCH' });
}
```

### 5.9 Complete Urgency

**Endpoint:** `PATCH /urgencies/:id/complete`  
**Access:** Doctor only

```typescript
async function completeUrgency(id: string): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/complete`, { method: 'PATCH' });
}
```

### 5.10 Update Urgency Vital Signs

**Endpoint:** `PATCH /urgencies/:id/vitals`  
**Access:** Nurse only

```typescript
async function updateUrgencyVitals(id: string, vitals: VitalSigns): Promise<Urgency> {
  return apiClient.request(`/urgencies/${id}/vitals`, {
    method: 'PATCH',
    body: JSON.stringify(vitals),
  });
}
```

---

## 6. Consultations Management

### 6.1 Get Doctor's Schedule

**Endpoint:** `GET /consultations/my-schedule`  
**Access:** Doctor only

```typescript
async function getMySchedule(): Promise<Consultation[]> {
  return apiClient.request('/consultations/my-schedule');
}
```

### 6.2 Get Doctor's Consultations

**Endpoint:** `GET /consultations/my`  
**Access:** Doctor only

```typescript
async function getMyConsultations(): Promise<Consultation[]> {
  return apiClient.request('/consultations/my');
}
```

### 6.3 Get Consultations by Patient

**Endpoint:** `GET /consultations/patient/:patientId`  
**Access:** Doctor, Nurse

```typescript
async function getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
  return apiClient.request(`/consultations/patient/${patientId}`);
}
```

### 6.4 Get Consultation by ID

**Endpoint:** `GET /consultations/:id`  
**Access:** Authenticated users (with access control)

```typescript
async function getConsultationById(id: string): Promise<Consultation> {
  return apiClient.request(`/consultations/${id}`);
}
```

### 6.5 Start Consultation

**Endpoint:** `PATCH /consultations/:id/start`  
**Access:** Doctor only (assigned)

```typescript
async function startConsultation(id: string): Promise<Consultation> {
  return apiClient.request(`/consultations/${id}/start`, { method: 'PATCH' });
}
```

> **Note:** This automatically updates Queue status to IN_PROGRESS.

### 6.6 Add Note to Consultation

**Endpoint:** `PATCH /consultations/:id/note`  
**Access:** Doctor, Nurse

```typescript
interface AddNoteRequest {
  note: string;
}

async function addConsultationNote(id: string, note: string): Promise<Consultation> {
  return apiClient.request(`/consultations/${id}/note`, {
    method: 'PATCH',
    body: JSON.stringify({ note }),
  });
}
```

### 6.7 Complete Consultation

**Endpoint:** `PATCH /consultations/:id/complete`  
**Access:** Doctor only

```typescript
interface CompleteConsultationRequest {
  diagnosis?: string;
  notes?: string;
}

async function completeConsultation(id: string, data: CompleteConsultationRequest): Promise<Consultation> {
  return apiClient.request(`/consultations/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 6.8 Cancel Consultation

**Endpoint:** `PATCH /consultations/:id/cancel`  
**Access:** Doctor, Primary Secretary, Admin

```typescript
async function cancelConsultation(id: string): Promise<Consultation> {
  return apiClient.request(`/consultations/${id}/cancel`, { method: 'PATCH' });
}
```

---

## 7. Queue Management

### Priority Algorithm

The queue uses an advanced priority calculation:

```
Priority = (0.5 × Urgency/5) + (0.5 × WaitTime/120) + Bonuses/Penalties

Bonuses:
- +0.2 for critical urgency (level 5)
- +0.1 for fully validated patients
- +0.05 per 30-min bracket beyond 1h wait

Penalties:
- -0.05 for unvalidated patients
- -0.15 for rejected patients
```

### 7.1 Add to Queue

**Endpoint:** `POST /queue`  
**Access:** Admin, Primary Secretary

```typescript
interface AddToQueueRequest {
  consultationId: string;
  patientId: string;
  specialtyId: string;
  urgencyLevel: 'LOW' | 'MODERATE' | 'URGENT' | 'CRITICAL';
}

async function addToQueue(data: AddToQueueRequest): Promise<QueueEntry> {
  return apiClient.request('/queue', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 7.2 Get Queue

**Endpoint:** `GET /queue?status={status}`  
**Access:** Role-based
- Secondary Secretary: Their hospital only
- Others: All entries

```typescript
async function getQueue(status?: 'waiting' | 'in_progress' | 'completed' | 'cancelled'): Promise<QueueEntry[]> {
  const query = status ? `?status=${status}` : '';
  return apiClient.request(`/queue${query}`);
}
```

### 7.3 Get Queue for My Hospital

**Endpoint:** `GET /queue/my-hospital`  
**Access:** Secondary Secretary, Nurse

```typescript
async function getMyHospitalQueue(): Promise<QueueEntry[]> {
  return apiClient.request('/queue/my-hospital');
}
```

### 7.4 Get Queue Statistics

**Endpoint:** `GET /queue/stats`  
**Access:** Admin, Primary Secretary

```typescript
interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

async function getQueueStats(): Promise<QueueStats> {
  return apiClient.request('/queue/stats');
}
```

### 7.5 Update Queue Status

**Endpoint:** `PATCH /queue/:id/status`  
**Access:** Admin, Primary Secretary, Doctor

```typescript
interface UpdateQueueStatusRequest {
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
}

async function updateQueueStatus(id: string, status: string): Promise<QueueEntry> {
  return apiClient.request(`/queue/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
```

### 7.6 Remove from Queue

**Endpoint:** `PATCH /queue/:id/remove`  
**Access:** Admin, Primary Secretary

```typescript
async function removeFromQueue(id: string): Promise<void> {
  return apiClient.request(`/queue/${id}/remove`, { method: 'PATCH' });
}
```

---

## 8. Prescriptions Management

### 8.1 Create Prescription

**Endpoint:** `POST /prescriptions`  
**Access:** Doctor only

```typescript
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface CreatePrescriptionRequest {
  consultationId: string;
  patientId: string;
  medications: Medication[];
  instructions?: string;
}

async function createPrescription(data: CreatePrescriptionRequest): Promise<Prescription> {
  return apiClient.request('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 8.2 Get Prescriptions

**Endpoint:** `GET /prescriptions`  
**Access:** Doctor (own prescriptions)

```typescript
async function getPrescriptions(): Promise<Prescription[]> {
  return apiClient.request('/prescriptions');
}
```

### 8.3 Get Prescriptions for My Hospital

**Endpoint:** `GET /prescriptions/my-hospital`  
**Access:** Nurse

```typescript
async function getHospitalPrescriptions(): Promise<Prescription[]> {
  return apiClient.request('/prescriptions/my-hospital');
}
```

### 8.4 Get Prescription by ID

**Endpoint:** `GET /prescriptions/:id`  
**Access:** Doctor (owner), Nurse (same hospital)

```typescript
async function getPrescriptionById(id: string): Promise<Prescription> {
  return apiClient.request(`/prescriptions/${id}`);
}
```

### 8.5 Update Prescription

**Endpoint:** `PATCH /prescriptions/:id`  
**Access:** Doctor only (owner)

```typescript
async function updatePrescription(id: string, data: Partial<CreatePrescriptionRequest>): Promise<Prescription> {
  return apiClient.request(`/prescriptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 8.6 Mark Prescription as Dispensed

**Endpoint:** `PATCH /prescriptions/:id/dispense`  
**Access:** Nurse only

```typescript
async function dispensePrescription(id: string): Promise<Prescription> {
  return apiClient.request(`/prescriptions/${id}/dispense`, { method: 'PATCH' });
}
```

---

## 9. Files Management

### 9.1 Upload File

**Endpoint:** `POST /files/upload`  
**Access:** All authenticated users  
**Content-Type:** `multipart/form-data`

```typescript
interface UploadFileRequest {
  file: File;
  relatedEntityType?: 'urgency' | 'patient' | 'consultation' | 'prescription' | 'other';
  relatedEntityId?: string;
}

async function uploadFile(file: File, entityType?: string, entityId?: string): Promise<FileEntity> {
  const formData = new FormData();
  formData.append('file', file);
  if (entityType) formData.append('relatedEntityType', entityType);
  if (entityId) formData.append('relatedEntityId', entityId);
  
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  return response.json();
}
```

### 9.2 Get File by ID

**Endpoint:** `GET /files/:id`  
**Access:** All authenticated users

```typescript
async function getFileById(id: string): Promise<FileEntity> {
  return apiClient.request(`/files/${id}`);
}
```

### 9.3 Get Files by Entity

**Endpoint:** `GET /files/entity/:entityType/:entityId`  
**Access:** All authenticated users

```typescript
async function getFilesByEntity(entityType: string, entityId: string): Promise<FileEntity[]> {
  return apiClient.request(`/files/entity/${entityType}/${entityId}`);
}
```

### 9.4 Get My Uploaded Files

**Endpoint:** `GET /files/my`  
**Access:** All authenticated users

```typescript
async function getMyFiles(): Promise<FileEntity[]> {
  return apiClient.request('/files/my');
}
```

### 9.5 Delete File

**Endpoint:** `DELETE /files/:id`  
**Access:** Owner or Admin

```typescript
async function deleteFile(id: string): Promise<void> {
  return apiClient.request(`/files/${id}`, { method: 'DELETE' });
}
```

---

## 10. Notifications

### 10.1 Get My Notifications

**Endpoint:** `GET /notifications/my`  
**Access:** All authenticated users

```typescript
async function getMyNotifications(): Promise<Notification[]> {
  return apiClient.request('/notifications/my');
}
```

### 10.2 Get Unread Notifications

**Endpoint:** `GET /notifications/my/unread`  
**Access:** All authenticated users

```typescript
async function getUnreadNotifications(): Promise<Notification[]> {
  return apiClient.request('/notifications/my/unread');
}
```

### 10.3 Get Unread Count

**Endpoint:** `GET /notifications/my/unread-count`  
**Access:** All authenticated users

```typescript
async function getUnreadCount(): Promise<{ count: number }> {
  return apiClient.request('/notifications/my/unread-count');
}
```

### 10.4 Mark as Read

**Endpoint:** `PATCH /notifications/:id/read`  
**Access:** All authenticated users

```typescript
async function markNotificationAsRead(id: string): Promise<Notification> {
  return apiClient.request(`/notifications/${id}/read`, { method: 'PATCH' });
}
```

### 10.5 Mark All as Read

**Endpoint:** `PATCH /notifications/read-all`  
**Access:** All authenticated users

```typescript
async function markAllNotificationsAsRead(): Promise<void> {
  return apiClient.request('/notifications/read-all', { method: 'PATCH' });
}
```

### 10.6 Send Notification (Admin)

**Endpoint:** `POST /notifications/send/:userId`  
**Access:** Admin only

```typescript
interface SendNotificationRequest {
  title: string;
  message: string;
  type?: string;
}

async function sendNotification(userId: string, data: SendNotificationRequest): Promise<Notification> {
  return apiClient.request(`/notifications/send/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 10.7 Delete Notification

**Endpoint:** `DELETE /notifications/:id`  
**Access:** Admin only

```typescript
async function deleteNotification(id: string): Promise<void> {
  return apiClient.request(`/notifications/${id}`, { method: 'DELETE' });
}
```

### 10.8 Real-time WebSocket Notifications

**Namespace:** `/notifications`

```typescript
import { io, Socket } from 'socket.io-client';

function connectNotifications(token: string): Socket {
  const socket = io(`${API_BASE_URL}/notifications`, {
    auth: { token },
    transports: ['websocket'],
  });
  
  socket.on('notification', (notification: Notification) => {
    console.log('New notification:', notification);
    // Handle notification in UI
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
  
  return socket;
}
```

---

## 11. Reports & Complaints

### Reports

#### 11.1 Create Report

**Endpoint:** `POST /reports`  
**Access:** All authenticated users

```typescript
interface CreateReportRequest {
  title: string;
  description: string;
  type: 'SYSTEM' | 'USER' | 'CONSULTATION' | 'HOSPITAL' | 'OTHER';
}

async function createReport(data: CreateReportRequest): Promise<Report> {
  return apiClient.request('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

#### 11.2 Get All Reports (Admin)

**Endpoint:** `GET /reports?status={status}&type={type}&hospitalId={hospitalId}`  
**Access:** Admin only

```typescript
async function getReports(params?: { status?: string; type?: string; hospitalId?: string }): Promise<Report[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiClient.request(`/reports${query ? `?${query}` : ''}`);
}
```

#### 11.3 Get My Reports

**Endpoint:** `GET /reports/my`  
**Access:** All authenticated users

```typescript
async function getMyReports(): Promise<Report[]> {
  return apiClient.request('/reports/my');
}
```

### Complaints

#### 11.4 Create Complaint

**Endpoint:** `POST /complaints`  
**Access:** All authenticated users

```typescript
interface CreateComplaintRequest {
  title: string;
  description: string;
  type: 'SERVICE' | 'STAFF' | 'SYSTEM' | 'BILLING' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

async function createComplaint(data: CreateComplaintRequest): Promise<Complaint> {
  return apiClient.request('/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

#### 11.5 Get All Complaints (Admin)

**Endpoint:** `GET /complaints?status={status}&type={type}&priority={priority}&hospitalId={hospitalId}`  
**Access:** Admin only

```typescript
async function getComplaints(params?: { status?: string; type?: string; priority?: string; hospitalId?: string }): Promise<Complaint[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiClient.request(`/complaints${query ? `?${query}` : ''}`);
}
```

#### 11.6 Get My Complaints

**Endpoint:** `GET /complaints/my`  
**Access:** All authenticated users

```typescript
async function getMyComplaints(): Promise<Complaint[]> {
  return apiClient.request('/complaints/my');
}
```

---

## 12. Analytics

### 12.1 Network Overview

**Endpoint:** `GET /analytics/network`  
**Access:** Admin only

```typescript
interface NetworkAnalytics {
  hospitals: {
    total: number;
    primary: number;
    secondary: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  patients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  consultations: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  queue: {
    total: number;
    waiting: number;
    inProgress: number;
  };
  reports: {
    total: number;
    pending: number;
  };
  complaints: {
    total: number;
    pending: number;
    urgent: number;
  };
}

async function getNetworkAnalytics(): Promise<NetworkAnalytics> {
  return apiClient.request('/analytics/network');
}
```

### 12.2 Branch Statistics

**Endpoint:** `GET /analytics/branch/:hospitalId`  
**Access:** Admin only

```typescript
interface BranchAnalytics {
  hospital: Hospital;
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  patients: {
    total: number;
    active: number;
  };
  consultations: {
    total: number;
    byStatus: Record<string, number>;
    averageDuration: number;
  };
  queue: {
    total: number;
    waiting: number;
  };
  reports: { total: number; pending: number };
  complaints: { total: number; pending: number };
  lastActivity: string;
}

async function getBranchAnalytics(hospitalId: string): Promise<BranchAnalytics> {
  return apiClient.request(`/analytics/branch/${hospitalId}`);
}
```

---

## 13. System Settings

### 13.1 Get System Settings

**Endpoint:** `GET /system/settings`  
**Access:** Admin only

```typescript
interface SystemSettings {
  app: {
    name: string;
    version: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  features: {
    videoConsultations: boolean;
    audioConsultations: boolean;
    chatConsultations: boolean;
    patientRegistration: boolean;
    onlinePayments: boolean;
    notifications: boolean;
    reports: boolean;
    complaints: boolean;
  };
  limits: {
    maxConsultationDuration: number;
    maxQueueSize: number;
    maxFileUploadSize: number;
    maxUsersPerHospital: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    emailFrom: string;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  business: {
    defaultCurrency: string;
    consultationFee: number;
    cancellationFee: number;
    refundPolicy: string;
  };
}

async function getSystemSettings(): Promise<SystemSettings> {
  return apiClient.request('/system/settings');
}
```

### 13.2 Update System Settings

**Endpoint:** `PATCH /system/settings`  
**Access:** Admin only

```typescript
async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  return apiClient.request('/system/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}
```

### 13.3 Toggle Maintenance Mode

**Endpoint:** `PATCH /system/maintenance`  
**Access:** Admin only

```typescript
interface MaintenanceModeRequest {
  enabled: boolean;
  message?: string;
}

async function toggleMaintenanceMode(data: MaintenanceModeRequest): Promise<SystemSettings> {
  return apiClient.request('/system/maintenance', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
```

### 13.4 Check Maintenance Mode (Public)

**Endpoint:** `GET /system/maintenance`  
**Access:** Public (no authentication)

```typescript
async function checkMaintenanceMode(): Promise<{ maintenanceMode: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/system/maintenance`);
  return response.json();
}
```

### 13.5 Get System Health

**Endpoint:** `GET /system/health`  
**Access:** Admin only

```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded';
  database: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number; // seconds
}

async function getSystemHealth(): Promise<SystemHealth> {
  return apiClient.request('/system/health');
}
```

---

## 14. WebRTC Integration

### WebSocket Events for Video Calls

**Namespace:** Main WebSocket connection

```typescript
import { io, Socket } from 'socket.io-client';

interface WebRTCRoom {
  roomId: string;
  consultationId: string;
  doctorId: string;
  patientId: string;
}

function setupWebRTC(token: string): Socket {
  const socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  // Join room
  socket.emit('join-room', { consultationId: 'xxx' });

  // Send WebRTC offer
  socket.emit('offer', {
    roomId: 'xxx',
    offer: rtcOffer, // RTCSessionDescriptionInit
  });

  // Send WebRTC answer
  socket.emit('answer', {
    roomId: 'xxx',
    answer: rtcAnswer, // RTCSessionDescriptionInit
  });

  // Send ICE candidate
  socket.emit('ice-candidate', {
    roomId: 'xxx',
    candidate: iceCandidate, // RTCIceCandidateInit
  });

  // Leave room
  socket.emit('leave-room', { roomId: 'xxx' });

  // Event listeners
  socket.on('user-joined', (data: { peerId: string }) => {
    console.log('User joined:', data.peerId);
  });

  socket.on('offer', (data: { offer: RTCSessionDescriptionInit }) => {
    // Handle incoming offer
  });

  socket.on('answer', (data: { answer: RTCSessionDescriptionInit }) => {
    // Handle incoming answer
  });

  socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit }) => {
    // Add ICE candidate
  });

  socket.on('user-left', (data: { peerId: string }) => {
    console.log('User left:', data.peerId);
  });

  return socket;
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface APIError {
  statusCode: number;
  message: string;
  error?: string;
}

// Common status codes:
// 400 - Bad Request (validation error, business rule violation)
// 401 - Unauthorized (missing or invalid token)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found (resource doesn't exist)
// 409 - Conflict (duplicate resource, business rule conflict)
// 500 - Internal Server Error
```

### Error Handling Example

```typescript
async function handleAPIError(error: any) {
  if (error.statusCode === 401) {
    // Token expired - try to refresh
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const newAuth = await refreshToken(refreshToken);
        localStorage.setItem('accessToken', newAuth.accessToken);
        // Retry original request
      } catch {
        // Refresh failed - redirect to login
        window.location.href = '/login';
      }
    }
  } else if (error.statusCode === 403) {
    // Access denied - show error message
    toast.error('Vous n\'avez pas les permissions nécessaires');
  } else {
    toast.error(error.message || 'Une erreur est survenue');
  }
}
```

---

## Zustand Store Integration Example

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          await apiClient.request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await apiClient.request('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

---

## Role-Based Access Summary

| Endpoint Category | Admin | Primary Secretary | Secondary Secretary | Doctor | Nurse |
|------------------|-------|-------------------|---------------------|--------|-------|
| User Management | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| Hospital Management | ✅ Full | ✅ Read | ❌ | ✅ Read | ❌ |
| Patient Management | ✅ Full | ✅ Read/Deactivate | ✅ CRUD (own hospital) | ✅ Read/EHR | ✅ Vitals/EHR |
| Urgency Management | ✅ Full | ✅ Validate/Assign | ✅ Create | ✅ Start/Complete | ✅ Vitals |
| Consultation Management | ✅ Full | ✅ Cancel | ❌ | ✅ Full | ✅ Notes |
| Queue Management | ✅ Full | ✅ Full | ✅ Read (own hospital) | ✅ Status | ✅ Read |
| Prescriptions | ✅ Full | ❌ | ❌ | ✅ Full | ✅ Read/Dispense |
| Files | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Notifications | ✅ Full + Send | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| Reports/Complaints | ✅ Full | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| Analytics | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ Full | ❌ | ❌ | ❌ | ❌ |

---

**Last Updated:** December 2025  
**API Version:** 1.0.0

