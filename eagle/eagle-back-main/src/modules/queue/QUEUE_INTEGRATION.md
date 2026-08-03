# Queue Module Integration Guide

## Overview

The Queue Module manages patient waiting queues for consultations. It automatically calculates positions, priorities, and wait times based on urgency levels.

---

## Integration with Consultations Module (Phase 2)

### 1. Adding Patients to Queue

When a consultation is created with status `SCHEDULED`, automatically add the patient to the queue:

```typescript
// In consultations.service.ts
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly consultationsRepository: ConsultationsRepository,
    private readonly queueService: QueueService, // Inject QueueService
  ) {}

  async create(consultation: Consultation): Promise<Consultation> {
    const created = await this.consultationsRepository.create(consultation);
    
    // Add to queue if status is SCHEDULED
    if (created.status === ConsultationStatus.SCHEDULED) {
      try {
        await this.queueService.addToQueue({
          consultationId: created.id,
          patientId: created.patientId,
          specialtyId: created.specialtyId || null,
          urgencyLevel: created.urgencyLevel || null,
          urgencyId: created.urgencyId || null, // Link to urgency for validation status
        });
      } catch (error) {
        // Log error but don't fail consultation creation
        console.error('Failed to add consultation to queue:', error);
      }
    }
    
    return created;
  }
}
```

**Required in ConsultationsModule:**
```typescript
// consultations.module.ts
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [FirebaseModule, QueueModule], // Add QueueModule
  // ...
})
export class ConsultationsModule {}
```

---

### 2. Updating Queue Status

#### When Consultation Starts (IN_PROGRESS)

```typescript
async startConsultation(id: string): Promise<Consultation> {
  const consultation = await this.consultationsRepository.update(id, {
    status: ConsultationStatus.IN_PROGRESS,
    startedAt: new Date(),
  });
  
  // Update queue status
  const queue = await this.queueService.findByConsultationId(id);
  if (queue && queue.status === QueueStatus.WAITING) {
    await this.queueService.updateStatus(queue.id, QueueStatus.IN_PROGRESS);
  }
  
  return consultation;
}
```

#### When Consultation Completes (COMPLETED)

```typescript
async completeConsultation(id: string): Promise<Consultation> {
  const consultation = await this.consultationsRepository.update(id, {
    status: ConsultationStatus.COMPLETED,
    endedAt: new Date(),
  });
  
  // Update queue status
  const queue = await this.queueService.findByConsultationId(id);
  if (queue) {
    await this.queueService.updateStatus(queue.id, QueueStatus.COMPLETED);
  }
  
  return consultation;
}
```

#### When Consultation is Cancelled (CANCELLED)

```typescript
async cancelConsultation(id: string): Promise<Consultation> {
  const consultation = await this.consultationsRepository.update(id, {
    status: ConsultationStatus.CANCELLED,
  });
  
  // Remove from queue or mark as cancelled
  const queue = await this.queueService.findByConsultationId(id);
  if (queue) {
    if (queue.status === QueueStatus.WAITING) {
      await this.queueService.removeFromQueue(queue.id);
    } else {
      await this.queueService.updateStatus(queue.id, QueueStatus.CANCELLED);
    }
  }
  
  return consultation;
}
```

---

## Queue Service API Reference

### Methods

#### `addToQueue(dto: AddToQueueDto): Promise<Queue>`
Adds a patient to the queue when consultation is scheduled.

**Parameters:**
- `consultationId`: ID of the consultation
- `patientId`: ID of the patient
- `specialtyId`: Optional specialty ID
- `urgencyLevel`: Optional urgency level (LOW, MODERATE, URGENT, CRITICAL)
- `urgencyId`: Optional urgency ID (links to urgencies collection for validation status)

**Validation Status Integration:**
When `urgencyId` is provided, the queue service automatically fetches validation status from the urgencies collection and applies priority bonuses/penalties:
- `PENDING` → -0.05 priority penalty
- `VALIDATED_PRIMARY_SECRETARY` → +0.1 priority bonus
- `APPROVED/ASSIGNED/IN_PROGRESS` → +0.1 priority bonus
- `REJECTED` → -0.15 priority penalty

**Returns:** Created queue entry with calculated position and wait time

---

#### `findByConsultationId(consultationId: string): Promise<Queue | null>`
Finds queue entry by consultation ID.

**Use case:** When updating consultation status, find the associated queue entry.

---

#### `updateStatus(id: string, status: QueueStatus, calledAt?: Date): Promise<Queue>`
Updates queue entry status.

**Status transitions:**
- `WAITING` → `IN_PROGRESS` (when consultation starts)
- `IN_PROGRESS` → `COMPLETED` (when consultation ends)
- `WAITING` → `CANCELLED` (when consultation cancelled)

---

#### `removeFromQueue(queueId: string): Promise<void>`
Removes queue entry (use when consultation is cancelled before starting).

---

#### `getQueue(userRole: UserRole, userHospitalId?: string, status?: QueueStatus): Promise<Queue[]>`
Gets queue with role-based filtering.

**Role behavior:**
- `SECONDARY_SECRETARY`: Only sees patients from their hospital
- `PRIMARY_SECRETARY`, `ADMIN`: Sees all queues (global view)
- `DOCTOR`, `NURSE`: See all queues

---

## Queue Status Flow

```
SCHEDULED Consultation Created
    ↓
WAITING (in queue)
    ↓
IN_PROGRESS (consultation started)
    ↓
COMPLETED (consultation ended)
```

If consultation is cancelled:
- Before IN_PROGRESS: Remove from queue
- After IN_PROGRESS: Mark as CANCELLED

---

## Priority Mapping

Queue priorities are automatically calculated from urgency levels:

| Urgency Level | Queue Priority |
|--------------|----------------|
| CRITICAL      | URGENT         |
| URGENT        | URGENT         |
| MODERATE      | HIGH           |
| LOW           | NORMAL         |

---

## Error Handling

The queue service handles errors gracefully:
- If consultation doesn't exist, queue operations fail safely
- Duplicate queue entries are prevented (ConflictException)
- Invalid status transitions are prevented (BadRequestException)

**Recommendation:** Wrap queue operations in try-catch when calling from consultation service to avoid blocking consultation workflow.

---

## Testing Integration

### Manual Test Flow

1. **Create Test Consultation in Firestore:**
```javascript
{
  id: "test-consultation-1",
  patientId: "some-patient-id",
  doctorId: "some-doctor-id",
  status: "scheduled",
  urgencyLevel: "URGENT",
  scheduledAt: new Date()
}
```

2. **Add to Queue:**
```bash
POST /queue
{
  "consultationId": "test-consultation-1",
  "patientId": "some-patient-id",
  "urgencyLevel": "URGENT"
}
```

3. **Verify Queue:**
```bash
GET /queue
```

4. **Update Status:**
```bash
PATCH /queue/{queueId}/status
{
  "status": "in_progress"
}
```

---

## Notes

- Queue positions are automatically recalculated when entries are added or removed
- Wait times are estimated based on average consultation duration (20 minutes)
- Queue entries include patient information for easy display
- All operations are role-based and respect access control
