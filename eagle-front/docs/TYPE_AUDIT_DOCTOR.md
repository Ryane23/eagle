# Doctor-related FE vs Backend Type Audit

## Summary

| Type | Status | Notes |
|------|--------|--------|
| User | Aligned | FE uses `name`, `phone`, `specialtyId` (no firstName/lastName/specialization). |
| Patient | Aligned | FE matches BE; BE has extra nurse workflow fields (optional). |
| Consultation | Aligned | Status/type enums match; BE entity has `prescriptions`, `labResults` (encrypted) not in FE response DTO. |
| CompleteConsultationDto | Mismatch | **Fixed**: BE only accepts `diagnosis`, `notes`. FE had `prescription`, `followUpRequired`, `followUpDate` (removed from FE type). |
| QueueEntry / Queue | Partial | BE Queue: `specialtyId`, `priority` (enum: low/normal/high/urgent), `estimatedWaitTime` (Date). FE has `priority` (number), `estimatedWaitTime` (number), `removed` status — BE has no `removed` (use `cancelled`). Map BE response to FE shape in API layer if needed. |
| Message | Partial | BE has `receiverId`, `type` (text/image/file/voice), `attachmentUrl`, `readAt`. FE type extended with optional fields. |
| Notification | Partial | BE has `relatedEntityId`, `relatedEntityType`; FE had `data`. Both supported via optional fields. |
| Prescription | Partial | BE: `medications[]` with `instructions` per medication, `isDispensed`, `dispensedBy`, `dispensedAt`. FE: `status` (active/dispensed/cancelled), `hospitalId`. Align: use `isDispensed` from BE; `status` can be derived. FE `PrescriptionMedication.notes` maps to BE `MedicationDto.instructions`. |
| Report | **Domain mismatch** | BE Report = incident/ticket (title, description, type: system/user/consultation/hospital/other, status: pending/in_review/resolved/rejected, reportedBy, related*). FE Report = medical report (consultationId, patientId, doctorId, content, type: consultation/prescription/lab/imaging/other, status: draft/final/amended). Doctor reports page may need a different backend (e.g. files or future medical-reports API) or repurpose to “my incident reports”. |
| Urgency | Partial | BE: `level` (enum), `reasonForConsultation`, `requestedSpecialty`. FE: `urgencyLevel` (number), `reason`, `description`, `validatedUrgencyLevel`. Mapping layer in API/hooks may be needed. |

## Actions Taken

- **CompleteConsultationDto**: Trimmed to `diagnosis?`, `notes?` to match backend. Frontend must not send `prescription`, `followUpRequired`, `followUpDate` to `PATCH /consultations/:id/complete`.
- **Message**: Added optional `receiverId?`, `type?`, `attachmentUrl?`, `readAt?` for compatibility with BE.
- **Notification**: Added optional `relatedEntityId?`, `relatedEntityType?`; kept `data?` for FE display.
- **Prescription**: Backend returns `isDispensed`; FE uses `status`. Normalizer in `actions/prescriptions.ts` maps `isDispensed` → `status` (`dispensed` | `active`) for all get/create/update/dispense responses.
- **Report**: Backend reports are incident/ticket (title, description, type, reportedBy, status: pending/in_review/resolved/rejected). Doctor reports page uses FE type (consultationId, patientId, content, status: draft/final/amended). If doctor page calls `/reports` API, DTOs differ; consider a dedicated medical-reports API or adapt FE to incident-report shape.
