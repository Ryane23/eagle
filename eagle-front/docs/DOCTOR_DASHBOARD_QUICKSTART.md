# Doctor Dashboard - Quick Start Guide

## Getting Started

### 1. Installation & Setup
```bash
# Install dependencies (if not already installed)
npm install
# or
pnpm install

# Run the development server
npm run dev
# or
pnpm dev
```

### 2. Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3000/dashboard/doctor
```

## Dashboard Components Overview

### Main Dashboard (`/dashboard/doctor`)
The main dashboard displays:
- **Header Bar**: Live clock, connection status, search, notifications, theme toggle
- **Quick Stats**: 4 metric cards showing today's key numbers
- **Quick Access**: Buttons for common actions
- **Next Patient**: Highlighted card for the next scheduled patient
- **Timeline**: Visual timeline of all appointments
- **Urgent Patients**: Sidebar showing high-priority patients
- **Quick Actions**: 8-button grid for fast access
- **Recent Activities**: Log of recent actions

### Statistics Page (`/dashboard/doctor/statistics`)
Comprehensive analytics with:
- Patient flow charts
- Wait time distribution
- Consultation completion pie chart
- Urgency level breakdown
- Daily/weekly/monthly trends
- Performance metrics

## Key Features to Test

### 1. Live Clock
- The header shows a live clock that updates every second
- Date is displayed in French format

### 2. Connection Toggle
- Click the power icon in the header to toggle connection status
- Status changes from "Connecté" (green) to "Hors ligne" (gray)

### 3. Dark/Light Mode
- Click the sun/moon icon in the header
- Dashboard switches between light and dark themes

### 4. Notifications
- Click the bell icon to see notifications
- Unread count is shown in a red badge
- Notifications panel shows recent alerts

### 5. Patient Details Modal
- Click the document icon on the "Next Patient" card
- Modal shows comprehensive patient information
- Includes medical history and previous consultations

### 6. Statistics Modal
- Click "Statistiques" in the Quick Actions grid (pink button)
- Opens a modal with detailed charts
- Switch between Today/Week/Month tabs

### 7. Help Button
- Click the floating help button (bottom-right corner)
- Shows support options (guide, chat, phone, email)

### 8. Timeline Interactions
- Each appointment shows status (completed, current, waiting, scheduled)
- Color-coded dots on the timeline
- Action buttons for each appointment

## Component Interactions

### Starting a Consultation
1. From the "Next Patient" card → Click "Démarrer la consultation"
2. From the Timeline → Click "Démarrer" on a waiting patient
3. From Urgent Patients → Click "Consulter"

### Viewing Patient Details
1. Click the document icon on the Next Patient card
2. Click "Voir dossier" on any timeline appointment
3. Modal opens with full patient information

### Accessing Statistics
1. Click "Statistiques" in Quick Actions grid
2. Navigate to `/dashboard/doctor/statistics` via sidebar
3. Both show comprehensive charts and analytics

## Navigation Structure

### Sidebar Menu
```
📊 Tableau de bord         → /dashboard/doctor
👥 Salle d'attente         → /dashboard/doctor/waiting-room
🚨 Gestion des Urgences    → /dashboard/doctor/emergencies [Badge: 2]
🎥 Salle de consultation   → /dashboard/doctor/consultation
📁 Dossiers patients       → /dashboard/doctor/patients
📊 Statistiques            → /dashboard/doctor/statistics
💬 Messages                → /dashboard/doctor/messages [Badge: 3]
⚙️  Paramètres             → /dashboard/doctor/settings
❓ Aide                    → /dashboard/doctor/help
```

## Mock Data Information

### Current Mock Data Includes:
- **Doctor**: Dr. Nana Pierre (Médecin Généraliste)
- **Patients**: 13 patients for today
- **Appointments**: 8 scheduled appointments (09:00 - 16:45)
- **Urgent Patients**: 2 (Levels 4 and 5)
- **Completed**: 3 consultations
- **Waiting**: 2 patients
- **Current**: 1 ongoing consultation

### Urgency Levels:
- **Level 1**: Very Low (Gray)
- **Level 2**: Low (Blue)
- **Level 3**: Moderate (Yellow)
- **Level 4**: Urgent (Orange)
- **Level 5**: Very Urgent (Red)

## Customization

### Changing Doctor Information
Edit `/app/(dashboard)/dashboard/doctor/layout.tsx`:
```typescript
const mockUser = {
  name: "Dr. Your Name",
  email: "your.email@eagle.cm",
  role: "doctor" as const,
  center: "Your Center",
};
```

### Modifying Mock Data
Each component has mock data at the top of the file:
- `quick-stats.tsx` → Stats data
- `timeline-planning.tsx` → Appointment data
- `urgent-patients.tsx` → Urgent patient data
- `recent-activities.tsx` → Activity log data

### Changing Colors/Styling
All components use Tailwind CSS classes. Common patterns:
- Primary color: `text-primary`, `bg-primary`
- Urgency colors: `text-orange-600`, `bg-red-500`, etc.
- Status colors: `text-green-600` (completed), `text-blue-600` (current)

## Chart Data Customization

### Statistics Charts
Edit data in:
- `components/doctor/statistics-modal.tsx`
- `app/(dashboard)/dashboard/doctor/statistics/page.tsx`

Example data structures:
```typescript
// Bar chart data
const patientFlowData = [
  { hour: "8h", patients: 2 },
  { hour: "9h", patients: 4 },
  // ...
];

// Pie chart data
const consultationCompletionData = [
  { name: "Terminées", value: 8, color: "#10b981" },
  { name: "En cours", value: 1, color: "#3b82f6" },
  // ...
];
```

## Responsive Breakpoints

The dashboard is responsive with these breakpoints:
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px (adapted grid)
- **Desktop**: > 1024px (full 2-column layout)

### Testing Responsive Design
1. Open browser DevTools (F12)
2. Click the device toolbar icon
3. Test different screen sizes

## Theme System

### Supported Themes
- **Light Mode**: Default bright theme
- **Dark Mode**: Dark background with adjusted colors
- **System**: Follows OS preference

### Theme Persistence
Theme preference is saved to localStorage and persists across sessions.

## Performance Tips

### For Development
- Charts may take a moment to render
- Consider reducing mock data size for faster iterations
- Use browser DevTools Performance tab for profiling

### For Production
- Ensure proper build: `npm run build`
- Test with production build: `npm start`
- Monitor bundle size

## Troubleshooting

### Charts Not Displaying
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data structure matches expected format

### Theme Toggle Not Working
- Verify ThemeProvider is in dashboard layout
- Check next-themes is installed
- Clear localStorage if needed

### Sidebar Not Showing
- Ensure you're accessing `/dashboard/doctor` (not just `/dashboard`)
- Check that sidebar provider is wrapping the layout
- Verify navigation data in `lib/constants/navigation.ts`

## Next Steps

### To Make It Production-Ready
1. Replace mock data with API calls
2. Implement authentication
3. Add real-time WebSocket updates
4. Integrate video consultation system
5. Connect to patient database
6. Implement prescription generation
7. Add notification backend
8. Set up analytics tracking

## Support & Documentation

For more details, see:
- `DOCTOR_DASHBOARD_IMPLEMENTATION.md` - Full technical documentation
- Component files in `components/doctor/` - Individual component details
- Navigation in `lib/constants/navigation.ts` - Menu structure

## Component API Reference

### EnhancedDashboardHeader
```typescript
<EnhancedDashboardHeader
  doctorName="Dr. Name"
  specialty="Specialty"
  clinic="Clinic Name"
/>
```

### NextPatientBlock
```typescript
<NextPatientBlock
  onStartConsultation={() => {}}
  onViewDetails={() => {}}
/>
```

### TimelinePlanning
```typescript
<TimelinePlanning
  onStartConsultation={(id) => {}}
/>
```

### PatientDetailsModal
```typescript
<PatientDetailsModal
  open={isOpen}
  onOpenChange={setIsOpen}
  onStartConsultation={() => {}}
  onModifyUrgency={() => {}}
/>
```

### StatisticsModal
```typescript
<StatisticsModal
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

## Keyboard Shortcuts (Future Enhancement)
Suggested shortcuts for future implementation:
- `Ctrl/Cmd + K`: Open search
- `Ctrl/Cmd + N`: New consultation
- `Ctrl/Cmd + S`: Open statistics
- `Ctrl/Cmd + H`: Open help
- `Ctrl/Cmd + D`: Toggle dark mode

---

**Ready to explore!** 🚀 Navigate to `/dashboard/doctor` and start testing all the features!


