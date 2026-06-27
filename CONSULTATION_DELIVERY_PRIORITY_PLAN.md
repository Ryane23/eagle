# Consultation Delivery Plan - Ordered By Urgency and Priority

## Goal
Close all gaps in consultation workflow so Doctor and Nurse flows are clinically complete, technically reliable, and production-ready.

## Source References
- Doctor consultation page: `eagle-front/app/(dashboard)/dashboard/doctor/consultation/page.tsx`
- Doctor video controls: `eagle-front/app/(dashboard)/dashboard/doctor/consultation/_components/video-controls.tsx`
- Doctor workspace tabs: `eagle-front/app/(dashboard)/dashboard/doctor/consultation/_components/consultation-workspace.tsx`
- Consultation API types: `eagle-front/types/api.ts`
- Consultations actions: `eagle-front/actions/consultations.ts`
- Nurse teleconsultation page: `eagle-front/app/(dashboard)/dashboard/nurse/teleconsultation/page.tsx`
- Nurse post-consultation page: `eagle-front/app/(dashboard)/dashboard/nurse/post-consultation/page.tsx`
- Integration report mismatch: `eagle-back-main/documentation/API_INTEGRATION_REPORT.md`

---

## P0 - Critical (Do First)

### 1) Clinical Data Contract Completion
Priority: Highest  
Problem: Consultation model only supports basic diagnosis and note fields; structured prescription, exams, and follow-up are not first-class.  
Needed work:
- Extend consultation completion payload to include structured fields:
- diagnosis
- clinicalNotes
- prescriptionItems
- examRequests
- followUpPlan
- followUpDate
- Ensure backend persists structured objects, not concatenated strings.
- Update doctor completion flow to send structured payload.
Done when:
- Completing a consultation stores all 5-tab data as structured fields.
- Data is retrievable and displayed correctly in doctor, nurse, and post-consultation pages.

### 2) End-to-End Consultation Completion Transaction
Priority: Highest  
Problem: Complete consultation, room ending, and post actions are split and can become inconsistent.  
Needed work:
- Make completion atomic:
- mark consultation completed
- set endedAt
- close WebRTC room
- emit notification/event for nurse post-consultation
- Add rollback or compensating action if any step fails.
Done when:
- No orphaned active rooms for completed consultations.
- No completed consultations without final room state.

### 3) Real Video Session Reliability
Priority: Highest  
Problem: Video flows still include hidden streams and placeholder states in operational paths.  
Needed work:
- Remove placeholder-only flow in active sessions.
- Ensure remote streams render once joined.
- Ensure screen sharing changes actual media tracks.
- Add reconnection handling and clear user status.
Done when:
- Doctor and nurse can join, see each other, and recover after network interruption.
- Screen share is visible to the remote side.

### 4) Remove Mock/Fallback Dependency in Live Nurse Consultation Paths
Priority: Highest  
Problem: Critical nurse consultation/teleconsultation behavior still uses mock-like defaults or incomplete mapping.  
Needed work:
- Replace static consultation and demographics fallbacks with API-driven state.
- Map real patient age and gender where available.
- Handle missing data with explicit empty states, not fake defaults.
Done when:
- Nurse pages reflect only real backend data for active consultations.

---

## P1 - High

### 5) Wire All Placeholder Buttons To Real Actions
Priority: High  
Problem: UI actions exist but are non-functional.  
Needed work:
- Connect these actions:
- Template notes
- Voice dictation
- Add medication
- Drug interaction check
- Camera snapshot
- In-call messaging
- Define minimal behavior for each action if full backend is pending.
Done when:
- Every visible action triggers a real user outcome and no dead buttons remain.

### 6) Post-Consultation Operations Integration
Priority: High  
Problem: print/send/download actions currently only log output.  
Needed work:
- Implement APIs and mutations for:
- print-ready generation
- signed PDF download
- sending via email or messaging channel
- document status transitions
Done when:
- Action buttons execute real workflows and update document status.

### 7) Consultation Continuity and Session Resilience
Priority: High  
Problem: reliance on browser session storage is fragile.  
Needed work:
- Use server state as source of truth for current consultation.
- Keep draft sync server-side with autosave.
- Support resume across refresh/device/session expiry.
Done when:
- User can recover in-progress consultation safely without losing context.

---

## P2 - Medium

### 8) Structured Nurse Contribution During Consultation
Priority: Medium  
Problem: nurse notes and vitals assistance during call are not fully integrated into shared consultation record.  
Needed work:
- Add nurse assistance channel to consultation record:
- nurse observations
- intra-consultation vitals updates
- handoff notes to doctor
- Add role-based visibility.
Done when:
- Doctor sees nurse inputs in real time or near-real time.

### 9) Query and Cache Consistency Hardening
Priority: Medium  
Problem: partial invalidation can cause stale views after mutations.  
Needed work:
- Align query keys and invalidation after start, save, complete, end-room.
- Add optimistic updates where safe.
Done when:
- No stale state after major consultation actions.

### 10) Teleconsultation Monitoring UX Completion
Priority: Medium  
Problem: monitoring tab contains placeholder sections and incomplete indicators.  
Needed work:
- Replace placeholder notes area with real synchronized notes feed.
- Show actual connection quality and stream health indicators.
Done when:
- Monitoring view is operational, not informational only.

---

## P3 - Low but Necessary

### 11) Documentation Alignment Sweep
Priority: Low  
Problem: docs and code status are out of sync.  
Needed work:
- Update integration report with current real status.
- Mark partial vs full integration accurately.
- Link each page to implemented hooks and missing APIs.
Done when:
- Documentation is trustworthy for onboarding and planning.

### 12) Test Coverage and Release Gates
Priority: Low  
Needed work:
- Add integration tests for:
- start consultation
- join call
- save note
- complete consultation
- room closure
- post-consultation document actions
- Add role-based regression tests for doctor and nurse permissions.
Done when:
- CI blocks release if consultation critical path is broken.

---

## Suggested Execution Order

1. P0.1 Clinical data contract completion
2. P0.2 Atomic completion transaction
3. P0.3 Real video session reliability
4. P0.4 Remove mock/fallback dependency in nurse live paths
5. P1.5 Wire placeholder buttons
6. P1.6 Post-consultation operation APIs
7. P1.7 Session resilience and autosave
8. P2.8 Nurse contribution model
9. P2.9 Cache consistency hardening
10. P2.10 Monitoring UX completion
11. P3.11 Documentation alignment
12. P3.12 Test and release gates

---

## Ownership Proposal

- Backend team:
- Data contract redesign
- Atomic consultation completion
- Post-consultation APIs
- Frontend team:
- Doctor and nurse flow wiring
- Placeholder removal
- Session resilience UX
- QA:
- Critical path scenario matrix
- Role and permission regression
- Tech lead:
- Priority enforcement
- Cross-team sequencing and acceptance criteria
