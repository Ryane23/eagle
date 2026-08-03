# Nurse Salle d'Attente - Ticket Generation Workflow

## Overview
Complete patient flow management system from arrival to consultation with automated ticket generation and smart queue management.

## Patient Journey Workflow

### 1. **Arrivés** (Newly Arrived)
**Status:** Patient has just arrived at the clinic
- Identity not yet verified
- No vital signs taken
- Waiting for nurse to register

**Nurse Actions:**
- Click "Vérifier identité" button
- Verify patient identity documents
- System automatically moves patient to "En attente"

### 2. **En Attente** (Waiting)
**Status:** Identity verified, waiting for preparation
- Identity verified ✓
- Ready to be prepared by nurse
- Waiting in virtual queue

**Nurse Actions:**
- Click "Préparer" button
- System redirects to Pre-consultation Room page
- Nurse takes vital signs and completes preparation

### 3. **Préparation** (Preparation)
**Status:** Being prepared by nurse
- Vital signs being recorded
- Preparation progress tracked (0-100%)
- Nurse assigns urgency level during this phase

**Preparation Steps:**
1. Take vital signs (TA, FC, FR, Temp, SpO2)
2. Record patient complaints
3. Assess urgency level (1-5)
4. Complete preparation checklist
5. Progress reaches 80-100%

**Nurse Actions (when progress ≥ 80%):**
- Click "Générer ticket" button
- Ticket Generator Modal opens

### 4. **Ticket Generation Modal**

#### Step 1: Review Patient Information
- Patient name, age, gender
- Specialty needed
- Appointment time
- Reason for visit

#### Step 2: Assign Urgency Level
Select from 5 levels:
- **Niveau 5 - Urgent** (U prefix, ~5 min delay)
  - Critical emergencies
  - Immediate attention required
  
- **Niveau 4 - Majeur** (M prefix, ~15 min delay)
  - Serious but stable conditions
  - Priority treatment needed
  
- **Niveau 3 - Modéré** (R prefix, ~30 min delay)
  - Regular consultation
  - Standard priority
  
- **Niveau 2 - Mineur** (N prefix, ~45 min delay)
  - Minor issues
  - Lower priority
  
- **Niveau 1 - Simple** (N prefix, ~60 min delay)
  - Routine checkup
  - Lowest priority

#### Step 3: Assign Doctor
- System filters doctors by patient's specialty
- Shows doctor availability status
- Displays current patient load per doctor
- Example: "Dr. Nana Pierre - 2 patients"

#### Step 4: Assign Consultation Room
- Select from available rooms
- Shows room floor location
- Displays availability status
- Occupied rooms are disabled

#### Step 5: Generate Ticket
System automatically:
1. **Generates unique ticket number** based on urgency:
   - Urgent (5): U001, U002, U003...
   - Major (4): M001, M002, M003...
   - Regular (3): R001, R002, R003...
   - Minor (1-2): N001, N002, N003...

2. **Calculates queue position**
   - Based on doctor's current patient load
   - Priority given to higher urgency levels

3. **Estimates consultation time**
   - Base delay + (current patients × 15 minutes)
   - Higher urgency = shorter estimated wait

4. **Creates printable ticket** with:
   - Large ticket number
   - Patient name
   - Assigned doctor
   - Consultation room
   - Specialty
   - Queue position
   - Estimated time
   - QR code placeholder
   - Date/time stamp

### 5. **Ticket Display**
The generated ticket shows:

```
═══════════════════════════════════
    CENTRE DE SANTÉ
    Ticket de Consultation
───────────────────────────────────

       Numéro de ticket
          U001
       [Urgent - Niveau 5]

───────────────────────────────────
Patient:          Tabi Aline
Médecin:          Dr. Nana Pierre
Salle:            Salle 1
Spécialité:       Cardiologie
Position file:    1ème
Heure estimée:    11:35
───────────────────────────────────

        [QR CODE]

    21 janvier 2026
    Merci de conserver ce ticket
═══════════════════════════════════
```

**Actions Available:**
- **Imprimer** - Print physical ticket
- **Télécharger** - Download PDF version
- **Confirmer** - Send patient to consultation

### 6. **In-Consultation** (En consultation)
**Status:** Patient sent to doctor with ticket
- Ticket generated ✓
- Assigned to specific doctor and room
- Waiting in doctor's queue with priority number

**Ticket Information Displayed:**
- Ticket number badge (colored by urgency)
- Queue position
- Estimated consultation time

## Smart Queue Management

### Automatic Numbering System
Tickets are numbered based on urgency prefix:
- **U (Urgent):** Priority 1 - Seen first
- **M (Major):** Priority 2 - Seen second
- **R (Regular):** Priority 3 - Standard queue
- **N (Normal/Minor):** Priority 4 - Standard queue

### Queue Position Calculation
```
Position = (Doctor's current patients) + 1

Example:
Dr. Nana Pierre has 2 patients
New patient assigned → Position 3
```

### Estimated Time Algorithm
```
Base Delay (from urgency level)
+ Additional Delay (current patients × 15 min)
= Total estimated wait time

Example:
Urgency 5 (Urgent) = 5 min base
Doctor has 2 patients = 2 × 15 = 30 min
Estimated time = Now + 35 minutes
```

## Visual Indicators

### Patient Cards Show:
1. **Urgency Badge** - Color-coded level indicator
2. **Category Badge** - Current workflow stage
3. **Specialty Badge** - Medical department
4. **Vital Signs Display** - If recorded
5. **Preparation Progress** - Percentage bar
6. **Ticket Number** - When generated (green badge)
7. **Queue Information** - Position and estimated time

### Color Coding:
- **Red/Urgent (5):** Immediate priority
- **Orange/Major (4):** High priority  
- **Yellow/Moderate (3):** Standard priority
- **Blue/Minor (2):** Lower priority
- **Gray/Simple (1):** Routine

## Workflow Summary

```
ARRIVÉS → VERIFY IDENTITY → EN ATTENTE
   ↓                              ↓
(Identity Check)           (Click Préparer)
                                  ↓
                           PRÉPARATION
                                  ↓
                     (Take vitals, assess urgency)
                                  ↓
                     (Progress reaches ≥80%)
                                  ↓
                     GENERATE TICKET MODAL
                                  ↓
        ┌────────────┬────────────┼────────────┐
        ↓            ↓            ↓            ↓
  Select Urgency  Assign Doctor  Assign Room  Generate
        └────────────┴────────────┴────────────┘
                                  ↓
                     TICKET PREVIEW
                                  ↓
                   (Print/Download/Confirm)
                                  ↓
                         IN-CONSULTATION
                                  ↓
                      (Doctor receives patient)
```

## Files Modified/Created

### New Components:
- `components/nurse/ticket-generator-modal.tsx` - Complete ticket generation UI

### Updated Pages:
- `app/(dashboard)/dashboard/nurse/salle-attente/page.tsx` - Main waiting room interface
  - Added ticket generation workflow
  - Integrated ticket modal
  - Added ticket display in patient cards
  - Updated action buttons for each stage

### Features Implemented:
1. ✅ 4-column Kanban board (Arrivés, En attente, Préparation, En consultation)
2. ✅ Smart ticket numbering (U/M/R/N prefixes)
3. ✅ Doctor assignment with availability check
4. ✅ Room assignment with floor location
5. ✅ Queue position calculation
6. ✅ Estimated time computation
7. ✅ Printable ticket preview
8. ✅ Urgency level modification during preparation
9. ✅ Visual ticket display on patient cards
10. ✅ Drag-and-drop between workflow stages

## Usage Instructions

### For Nurses:
1. When patient arrives → Click "Vérifier identité"
2. Patient moves to "En attente" automatically
3. Click "Préparer" to start preparation
4. Take vital signs in pre-consultation room
5. When preparation ≥80% complete → Return to Salle d'Attente
6. Click "Générer ticket" button
7. Assign urgency level (1-5)
8. Select available doctor
9. Select available room
10. Click "Générer le ticket"
11. Review ticket preview
12. Print/Download if needed
13. Click "Confirmer et envoyer en consultation"
14. Patient appears in "En consultation" with ticket number

### Best Practices:
- Assign urgency accurately based on patient condition
- Balance doctor workload when assigning patients
- Print tickets for patients who need physical copies
- Verify room availability before assignment
- Update preparation progress regularly
