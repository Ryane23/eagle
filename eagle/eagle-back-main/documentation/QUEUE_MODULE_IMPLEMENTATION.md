# Queue Module Implementation - Advanced Priority Algorithm

## ✅ Implementation Complete

The queue module has been enhanced with the advanced priority calculation algorithm from the EAGLE Queue Management System prototype.

---

## 📖 Simple Summary

**What is this?**  
Think of this like a smart waiting room system for a hospital. When patients arrive for teleconsultations, they join a virtual queue. This system automatically figures out who should be seen first.

**How does it decide who goes first?**  
The system looks at two main things:
1. **How urgent is the patient's condition?** (Critical patients get priority)
2. **How long have they been waiting?** (Patients waiting longer get moved up)

**What makes it "smart"?**  
- A patient with a critical condition who just arrived gets high priority
- But a patient with a moderate condition who's been waiting 70 minutes might actually go first!
- The system prevents anyone from being forgotten by giving bonus points for long waits
- If a patient's urgency has been validated by a primary secretary, they get extra priority

**Real Example:**
- **Patient A**: Critical condition, just arrived, validated → Gets priority score 0.8
- **Patient B**: Low urgency, waiting 30 min, not validated → Gets priority score 0.275
- **Patient C**: Urgent condition, waiting 70 min, validated → Gets priority score 0.842

**Who goes first?** Patient C (highest score), then Patient A, then Patient B

**Who can see what?**
- Administrators and Primary Secretaries see all patients globally
- Secondary Secretaries only see patients from their own hospital
- Doctors and Nurses can view the queue to prepare for consultations

**The Result:** A fair, intelligent queue that balances urgency with wait time, ensuring no patient is overlooked!

---

## 🎯 What Was Implemented

### 1. Enhanced Queue Entity
- Added `calculatedPriority` field (numeric score 0-2) for advanced sorting
- Added `urgencyLevel` field (1-5) for priority calculation
- Added `estimatedWaitMinutes` field for wait time tracking
- Added `validationStatus` field for priority bonuses/penalties (fetched from urgencies module)

### 2. Advanced Priority Algorithm
The queue now uses the EAGLE priority algorithm:

```
Priority = (0.5 × Urgency/5) + (0.5 × WaitTime/120) + Bonuses/Penalties
```

**Bonuses:**
- +0.2 for critical urgency (level 5)
- +0.1 for fully validated/approved patients
- +0.05 per 30-min bracket beyond 1h wait (prevents forgotten patients)

**Penalties:**
- -0.05 for unvalidated (PENDING) patients
- -0.15 for rejected patients

### 3. Enhanced Queue Service
- **`calculatePriority()`**: Implements the EAGLE algorithm
- **`estimateWaitTimeMinutes()`**: Calculates wait time based on position
- **`recalculatePositions()`**: Recalculates priorities and positions periodically
- **Priority-based sorting**: Queue entries sorted by `calculatedPriority` (descending)

### 4. Updated Repository
- `findWaitingOrdered()` now uses `calculatedPriority` for sorting instead of simple priority enum

---

## 📊 How It Works

### Priority Calculation Example

**Patient A (CRITICAL, just arrived, APPROVED):**
- Urgency: 5/5 = 1.0
- Wait time: 0/120 = 0.0
- Base: (0.5 × 1.0) + (0.5 × 0.0) = 0.5
- Bonus (critical): +0.2
- Bonus (approved): +0.1
- **Final Priority: 0.8**

**Patient B (LOW, waiting 30 min, PENDING):**
- Urgency: 2/5 = 0.4
- Wait time: 30/120 = 0.25
- Base: (0.5 × 0.4) + (0.5 × 0.25) = 0.325
- Penalty (pending): -0.05
- **Final Priority: 0.275**

**Patient C (URGENT, waiting 70 min, VALIDATED):**
- Urgency: 4/5 = 0.8
- Wait time: 70/120 = 0.583
- Base: (0.5 × 0.8) + (0.5 × 0.583) = 0.692
- Bonus (validated): +0.1
- Bonus (>60 min wait): +0.05
- **Final Priority: 0.842**

**Result:** Patient C (0.842) > Patient A (0.8) > Patient B (0.275)

### Position Calculation
Positions are calculated based on `calculatedPriority`:
1. Higher `calculatedPriority` = Lower position number (served first)
2. If priorities are equal, earlier arrival gets priority
3. Positions automatically recalculate when:
   - New patients are added
   - Patients are completed/cancelled
   - Priorities are updated

---

## 🧪 Testing

### Run Tests
```powershell
.\test-queue-module.ps1
```

### Test Coverage
✅ Add patient to queue (with priority calculation)  
✅ Get all queue entries (role-based filtering)  
✅ Get queue by status  
✅ Get queue statistics  
✅ Update queue status (WAITING → IN_PROGRESS → COMPLETED)  
✅ Remove queue entry  
✅ Priority algorithm verification  
✅ Position recalculation  
✅ Role-based access control  
✅ Wait time estimation  

---

## 🔧 API Endpoints

### Add to Queue
```http
POST /queue
Authorization: Bearer {token}
Content-Type: application/json

{
  "consultationId": "consultation-123",
  "patientId": "patient-456",
  "specialtyId": "Cardiology",
  "urgencyLevel": "CRITICAL",  // LOW, MODERATE, URGENT, CRITICAL
  "urgencyId": "urgency-789"      // Optional: Links to urgencies for validation status
}
```

**Response:**
```json
{
  "id": "queue-789",
  "patientId": "patient-456",
  "consultationId": "consultation-123",
  "specialtyId": "Cardiology",
  "status": "waiting",
  "priority": "urgent",
  "calculatedPriority": 0.9,
  "urgencyLevel": 5,
  "validationStatus": "APPROVED",
  "position": 1,
  "estimatedWaitTime": "2024-01-15T11:00:00.000Z",
  "estimatedWaitMinutes": 0,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Queue
```http
GET /queue?status=waiting
Authorization: Bearer {token}
```

**Response:** Array of queue entries sorted by `calculatedPriority` (descending)

### Get Queue Statistics
```http
GET /queue/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": 10,
  "waiting": 7,
  "inProgress": 2,
  "completed": 1,
  "cancelled": 0
}
```

### Update Queue Status
```http
PATCH /queue/{queueId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress"  // waiting, in_progress, completed, cancelled
}
```

---

## 🔐 Role-Based Access

| Endpoint | Admin | Primary Secretary | Secondary Secretary | Doctor | Nurse |
|----------|-------|-------------------|---------------------|--------|-------|
| `POST /queue` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /queue` | ✅ | ✅ | ✅ (hospital only) | ✅ | ✅ |
| `GET /queue/stats` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /queue/:id/status` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `PATCH /queue/:id/remove` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🔄 Integration Points

### With Consultations Module
The queue is automatically populated when a consultation is created with status `SCHEDULED`:

```typescript
// In consultations.service.ts
async create(consultation: Consultation) {
  const created = await this.repository.create(consultation);
  
  if (created.status === ConsultationStatus.SCHEDULED) {
    await this.queueService.addToQueue({
      consultationId: created.id,
      patientId: created.patientId,
      specialtyId: created.specialtyId,
      urgencyLevel: created.urgencyLevel
    });
  }
  
  return created;
}
```

### With Urgencies Module
When an urgency is assigned to a doctor, it creates a consultation which automatically adds to queue.

**Validation Status Integration:**
The queue module fetches validation status from the urgencies collection to apply priority bonuses/penalties:

```typescript
// Urgency status mapping:
PENDING → validationStatus: 'PENDING' (priority penalty -0.05)
VALIDATED_PRIMARY_SECRETARY → validationStatus: 'VALIDATED' (priority bonus +0.1)
APPROVED/ASSIGNED/IN_PROGRESS → validationStatus: 'APPROVED' (priority bonus +0.1)
REJECTED → validationStatus: 'REJECTED' (priority penalty -0.15)
```

This ensures:
- ✅ Validated/approved urgencies get higher priority
- ⚠️ Pending urgencies wait slightly longer
- ❌ Rejected urgencies receive lowest priority for re-evaluation

---

## 📈 Performance

- **Priority Calculation**: O(1) - Constant time
- **Queue Sorting**: O(n log n) - Efficient sorting
- **Position Recalculation**: O(n) - Linear time
- **Wait Time Estimation**: O(1) - Constant time

---

## 🎓 Key Features

1. **Intelligent Priority**: Considers both urgency and wait time
2. **Fair Queue**: Prevents patients from being forgotten (bonus for long waits)
3. **Real-time Updates**: Positions recalculate automatically
4. **Role-Based Filtering**: Secondary secretaries see only their hospital
5. **Status Tracking**: WAITING → IN_PROGRESS → COMPLETED workflow

---

## 🚀 Next Steps (Optional Enhancements)

1. **WebSocket Integration**: Real-time queue updates via WebSocket
2. **Periodic Recalculation**: Auto-recalculate priorities every 5 minutes
3. **Consultant Assignment**: Round-robin assignment to available doctors
4. **Analytics Dashboard**: Queue metrics and performance tracking
5. **SMS Notifications**: Notify patients when their turn is approaching

---

## 📝 Notes

- The priority algorithm is based on the EAGLE Queue Management System prototype
- Priority scores are capped between 0 and 2
- Wait time estimation assumes 20 minutes per consultation (configurable)
- Queue positions start at 1 (not 0)
- Validation status is automatically fetched from urgencies collection when `urgencyId` is provided
- If `urgencyId` is not provided, validation bonuses/penalties are not applied

---

**Implementation Date**: 2024-01-15  
**Last Updated**: 2026-01-23 (Validation Status Integration)  
**Status**: ✅ Complete and Tested
