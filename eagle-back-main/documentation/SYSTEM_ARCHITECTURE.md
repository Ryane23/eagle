# EAGLE System Architecture Overview

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         EAGLE SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   PATIENT    │────────▶│   URGENCY    │────────▶│ CONSULTATION │
│              │         │              │         │              │
│ - id         │         │ - patientId  │         │ - patientId  │
│ - name       │         │ - level      │         │ - doctorId   │
│ - hospitalId │         │ - status     │         │ - status     │
│              │         │ - createdBy  │         │ - scheduledAt│
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
      │                         │                         │
      │                         ▼                         │
      │                  ┌──────────────┐                │
      │                  │  PRIMARY     │                │
      │                  │  SECRETARY   │                │
      │                  │  Validates   │                │
      │                  └──────────────┘                │
      │                                                  │
      │                                                  ▼
      │                                         ┌──────────────┐
      │                                         │    QUEUE     │
      │                                         │              │
      │                                         │ - position   │
      │                                         │ - priority   │
      │                                         │ - waitTime   │
      │                                         └──────────────┘
      │                                                  │
      │                                                  ▼
      │                                         ┌──────────────┐
      │                                         │   DOCTOR     │
      │                                         │   Starts     │
      │                                         │   Consultation│
      │                                         └──────────────┘
      │                                                  │
      │                                                  ▼
      │                                         ┌──────────────┐
      │                                         │   WebRTC     │
      │                                         │   Video Call │
      │                                         └──────────────┘
      │                                                  │
      │                                                  ▼
      │                                         ┌──────────────┐
      │                                         │ PRESCRIPTION │
      │                                         │              │
      │                                         │ - medications│
      │                                         │ - instructions│
      │                                         └──────────────┘
      │                                                  │
      │                                                  ▼
      │                                         ┌──────────────┐
      │                                         │    NURSE     │
      │                                         │   Provides   │
      │                                         │  Prescription│
      │                                         └──────────────┘
```

---

## 📊 Entity Relationships

### Core Entities

```
PATIENT
├── id: string
├── firstName: string
├── lastName: string
├── hospitalId: string (SECONDARY center)
└── ...

URGENCY
├── id: string
├── patientId: string → PATIENT
├── hospitalId: string → HOSPITAL
├── createdBy: string → USER (SECONDARY_SECRETARY)
├── assignedDoctorId?: string → USER (DOCTOR)
├── status: UrgencyStatus
└── level: UrgencyLevel

CONSULTATION (Phase 2 - Your Partner)
├── id: string
├── patientId: string → PATIENT
├── doctorId: string → USER (DOCTOR)
├── urgencyId?: string → URGENCY (if created from urgency)
├── status: ConsultationStatus
├── scheduledAt: Date
└── type: ConsultationType (VIDEO/AUDIO/CHAT)

QUEUE (Phase 3 - YOU)
├── id: string
├── patientId: string → PATIENT
├── consultationId: string → CONSULTATION
├── specialtyId: string → SPECIALTY
├── status: QueueStatus
├── priority: QueuePriority
├── position: number
└── estimatedWaitTime?: Date

PRESCRIPTION (Phase 3 - YOU)
├── id: string
├── consultationId: string → CONSULTATION
├── patientId: string → PATIENT
├── doctorId: string → USER (DOCTOR)
├── medications: Medication[]
└── instructions?: string
```

---

## 🔄 Data Flow

### Complete Workflow

```
1. SECONDARY_SECRETARY creates URGENCY
   └─ Status: PENDING
   └─ Links: patientId, hospitalId, createdBy

2. PRIMARY_SECRETARY validates URGENCY
   └─ Status: VALIDATED_PRIMARY_SECRETARY → APPROVED
   └─ Can adjust urgency level

3. PRIMARY_SECRETARY assigns DOCTOR
   └─ Status: ASSIGNED
   └─ Sets: assignedDoctorId, scheduledAt
   └─ **AUTOMATICALLY CREATES CONSULTATION** (Phase 2)

4. CONSULTATION created
   └─ Status: SCHEDULED
   └─ Links: patientId, doctorId, urgencyId
   └─ **TRIGGERS QUEUE ENTRY** (Phase 3 - YOU)

5. QUEUE entry created (Phase 3 - YOU)
   └─ Status: WAITING
   └─ Links: consultationId, patientId
   └─ Calculates: position, priority, waitTime

6. DOCTOR starts consultation
   └─ Consultation Status: IN_PROGRESS
   └─ Queue Status: IN_PROGRESS
   └─ **INITIATES WebRTC CONNECTION** (Phase 3 - YOU)

7. WebRTC video call (Phase 3 - YOU)
   └─ Doctor and patient connect
   └─ Real-time video/audio streaming

8. DOCTOR creates PRESCRIPTION (Phase 3 - YOU)
   └─ Links: consultationId, patientId, doctorId
   └─ Contains: medications, instructions

9. Consultation completed
   └─ Consultation Status: COMPLETED
   └─ Queue Status: COMPLETED

10. NURSE provides prescription (Phase 3 - YOU)
    └─ Views prescription for patient
    └─ Can print/download
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
ADMIN
├── Full system access
├── Manage users, hospitals
└── View all data

PRIMARY_SECRETARY
├── Validate urgencies
├── Assign doctors
├── View global queue
└── View all consultations

SECONDARY_SECRETARY
├── Register patients
├── Create urgencies
├── View local queue (their hospital)
└── View their hospital's consultations

DOCTOR
├── View assigned consultations
├── Start/complete consultations
├── Create prescriptions
└── Join WebRTC calls

NURSE
├── View prescriptions for their hospital
├── Print prescriptions
└── View queue for their hospital
```

---

## 🔌 Integration Points for Phase 3

### 1. Queue ← Consultation Integration

**Trigger**: When consultation is created with status `SCHEDULED`

**Your Code**:
```typescript
// Option 1: Listen for consultation creation
// In queue.service.ts
async onConsultationScheduled(consultation: Consultation) {
  const queueEntry = await this.repository.create({
    consultationId: consultation.id,
    patientId: consultation.patientId,
    specialtyId: consultation.specialtyId || '',
    status: QueueStatus.WAITING,
    priority: this.mapUrgencyToPriority(consultation.urgencyLevel),
    position: await this.calculateNextPosition(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Recalculate all positions
  await this.recalculatePositions();
}
```

**How to trigger**:
- Your partner can call this method after creating consultation
- OR you can poll consultations collection
- OR use Firestore triggers (advanced)

---

### 2. WebRTC ← Consultation Integration

**Trigger**: When consultation status changes to `IN_PROGRESS`

**Your Code**:
```typescript
// In webrtc.service.ts
async startConsultation(consultationId: string) {
  // Create WebRTC room
  const room = await this.createRoom(consultationId);
  
  // Get consultation to find doctor and patient
  const consultation = await consultationsService.findById(consultationId);
  
  // Allow doctor and patient to join
  return {
    roomId: room.id,
    consultationId,
    doctorId: consultation.doctorId,
    patientId: consultation.patientId
  };
}
```

**WebSocket Events**:
- `join-room` - Doctor/patient joins
- `offer` - WebRTC offer from one peer
- `answer` - WebRTC answer from other peer
- `ice-candidate` - ICE candidate exchange
- `leave-room` - Participant leaves

---

### 3. Prescription ← Consultation Integration

**Trigger**: Doctor creates prescription during/after consultation

**Your Code**:
```typescript
// In prescriptions.service.ts
async createPrescription(
  consultationId: string,
  doctorId: string,
  data: CreatePrescriptionDto
) {
  // Verify consultation exists and doctor is assigned
  const consultation = await consultationsService.findById(consultationId);
  
  if (consultation.doctorId !== doctorId) {
    throw new ForbiddenException('Not assigned to this consultation');
  }
  
  // Create prescription
  const prescription = await this.repository.create({
    consultationId,
    patientId: consultation.patientId,
    doctorId,
    medications: data.medications,
    instructions: data.instructions,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Optionally mark consultation as completed
  // await consultationsService.complete(consultationId);
  
  return prescription;
}
```

---

## 🗄️ Database Collections (Firestore)

```
users/
  └─ {userId}
      ├─ role: "doctor" | "primary_secretary" | ...
      └─ hospitalId: "..."

hospitals/
  └─ {hospitalId}
      ├─ type: "PRIMARY" | "SECONDARY"
      └─ name: "..."

patients/
  └─ {patientId}
      ├─ hospitalId: "..." (SECONDARY center)
      └─ ...

urgencies/
  └─ {urgencyId}
      ├─ patientId: "..."
      ├─ status: "ASSIGNED"
      └─ assignedDoctorId: "..."

consultations/ (Phase 2)
  └─ {consultationId}
      ├─ patientId: "..."
      ├─ doctorId: "..."
      ├─ status: "SCHEDULED"
      └─ urgencyId: "..." (optional)

queue/ (Phase 3 - YOU)
  └─ {queueId}
      ├─ consultationId: "..."
      ├─ patientId: "..."
      ├─ status: "WAITING"
      └─ position: 1

prescriptions/ (Phase 3 - YOU)
  └─ {prescriptionId}
      ├─ consultationId: "..."
      ├─ patientId: "..."
      └─ medications: [...]
```

---

## 🎯 Phase 3 Implementation Priority

### Priority 1: Queue Management ⭐⭐⭐
- **Why first**: Simplest, helps you understand the system
- **Dependencies**: Needs consultations (your partner)
- **Complexity**: Low-Medium

### Priority 2: Prescriptions ⭐⭐
- **Why second**: Medium complexity, good learning
- **Dependencies**: Needs consultations (your partner)
- **Complexity**: Medium

### Priority 3: WebRTC ⭐
- **Why last**: Most complex, requires WebSocket knowledge
- **Dependencies**: Needs consultations (your partner)
- **Complexity**: High

---

## 📝 Key Files Reference

### Phase 3 Files You'll Work With

```
src/modules/queue/
├── queue.entity.ts ✅ (exists)
├── queue.repository.ts ❌ (create)
├── queue.service.ts ❌ (implement)
├── queue.controller.ts ❌ (implement)
└── queue.module.ts ✅ (exists, needs update)

src/modules/prescriptions/ ❌ (create entire module)
├── prescriptions.entity.ts
├── prescriptions.repository.ts
├── prescriptions.service.ts
├── prescriptions.controller.ts
├── prescriptions.module.ts
└── dto/
    ├── create-prescription.dto.ts
    └── update-prescription.dto.ts

src/modules/messages/ (or new webrtc module)
├── webrtc.gateway.ts ❌ (create)
└── webrtc.service.ts ❌ (create)
```

---

## 🚀 Getting Started Checklist

- [ ] Read `PHASE_3_IMPLEMENTATION_GUIDE.md`
- [ ] Read `PHASE_3_QUICK_START.md`
- [ ] Study `src/modules/patients/patients.service.ts` (example service)
- [ ] Study `src/modules/urgencies/urgencies.service.ts` (workflow example)
- [ ] Understand `BaseRepository` pattern
- [ ] Set up Postman for testing
- [ ] Start with Queue Management
- [ ] Test each feature as you build it

---

**You've got this! Start simple, build incrementally, test often.** 🎉

