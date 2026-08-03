# EAGLE Principal Secretary Dashboard - Development Guide

## System Overview

The EAGLE Principal Secretary Dashboard is a comprehensive healthcare management system for coordinating multiple medical centers, managing consultants, validating patient urgencies, and facilitating inter-clinic communication. The system serves as the central hub for a network of primary and secondary medical centers.

## Architecture & Design Patterns

### 1. Component Structure

**Layout Pattern:**
- **Sidebar Navigation**: Collapsible sidebar (52px collapsed, 240px expanded) with icon-only and full-text modes
- **Main Content Area**: Flex layout with header, breadcrumbs, and scrollable content
- **Modals & Panels**: Overlay modals for forms, side panels for details/activity

**Component Hierarchy:**
```
App
├── Sidebar (Collapsible Navigation)
├── Header (User info, notifications, search, dark mode toggle)
├── Breadcrumbs
└── Main Content
    ├── Stats Cards (Compact/Detailed/Hidden modes)
    ├── Filters & Search
    ├── Data Tables/Lists
    ├── Charts & Visualizations
    └── Action Panels
```

### 2. State Management Pattern

**React Hooks Usage:**
- `useState` for local component state
- `useEffect` for side effects and keyboard shortcuts
- `useRef` for DOM references and drag-and-drop
- No global state management (all state is component-local)

**Common State Variables:**
```typescript
const [navCollapsed, setNavCollapsed] = useState(false);
const [darkMode, setDarkMode] = useState(false);
const [activeNav, setActiveNav] = useState('dashboard');
const [selectedItem, setSelectedItem] = useState(null);
const [showModal, setShowModal] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState('all');
```

### 3. UI/UX Design Patterns

**Color System:**
- **Urgency Levels**: 
  - Level 1: Green (`bg-green-500`)
  - Level 2: Blue (`bg-blue-500`)
  - Level 3: Yellow (`bg-yellow-500`)
  - Level 4: Orange (`bg-orange-500`)
  - Level 5: Red (`bg-red-500`)

- **Status Indicators**:
  - Online: Green (`bg-green-100 text-green-800`)
  - Offline: Red (`bg-red-100 text-red-800`)
  - Warning: Yellow (`bg-yellow-100 text-yellow-800`)
  - Normal: Blue (`bg-blue-100 text-blue-800`)

**Spacing & Sizing:**
- Compact padding: `p-2`, `p-3`
- Standard padding: `p-4`, `p-6`
- Text sizes: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px)
- Icon sizes: `size-14`, `size-16`, `size-18`, `size-20`

**Card Components:**
- Background: `bg-white` (light) / `bg-gray-800` (dark)
- Border: `border border-gray-200` / `border-gray-700`
- Shadow: `shadow-sm` or `shadow`
- Rounded: `rounded-lg`

### 4. Key Features & Modules

#### A. Dashboard Overview (`sec-principal-dashboard.tsx`)
**Features:**
- Network-wide statistics (patients waiting, in consultation, avg wait time, urgent cases, centers online)
- Center management with status indicators
- Active consultants list
- Pending urgency validations
- Recent activity timeline
- Contextual tabs (Overview, Map, Favorites)
- Compact/Detailed/Hidden stats modes

**Key Components:**
- `renderCompactStats()`: Collapsible statistics bar
- `renderDashboardContent()`: Main dashboard view
- `renderWaitingRoomsContent()`: Waiting room management
- `renderUrgencyValidationContent()`: Urgency validation interface
- `renderConsultantsContent()`: Consultant management
- `renderPerformanceContent()`: Performance analytics

#### B. Urgency Validation (`eagle-urgency-validation.tsx`)
**Features:**
- Patient urgency level validation (1-5 scale)
- Adjust urgency levels up/down
- Force priority override
- Comment system for secretaries
- Filter by status (pending, validated, adjusted, all)
- Sort by time, urgency, or center
- Patient details with vital signs, medical history, notes

**Key Functions:**
- `handleValidateUrgency()`: Validate assigned urgency
- `handleAdjustUrgency(adjustment)`: Adjust urgency level
- `handleForcePriority()`: Force priority override
- `handleSendComment()`: Send comments to secondary secretaries

#### C. Consultant Management (`secretaire-principale-interface-amelioree.tsx`)
**Features:**
- Weekly/monthly planning calendar
- Drag-and-drop schedule management
- Consultant availability tracking
- Conflict detection and resolution
- Absence management
- Filter system with favorites
- Template-based planning
- Heatmap visualization
- Activity history panel

**Key Functions:**
- `handleDragStart()`: Start drag operation
- `handleDrop()`: Handle schedule item drop
- `modifyScheduleItem()`: Edit existing schedule
- `deleteScheduleItem()`: Remove schedule item
- `applyFilter()`: Apply saved filters
- `togglePinFilter()`: Pin/unpin filters

#### D. Inter-Clinic Communication (`eagle-interclinic-communication.tsx`)
**Features:**
- Real-time messaging with secondary centers
- Message templates
- File attachments (PDF, Excel, images)
- Urgent message flagging
- Message pinning
- Tag system for categorization
- Agent selection per clinic
- Search and filter messages
- Statistics dashboard

**Key Functions:**
- `handleSendMessage()`: Send message to clinic
- `handleSelectAgent()`: Select specific agent
- `togglePinMessage()`: Pin/unpin messages
- `handleNewConnectionSubmit()`: Add new clinic connection

#### E. Waiting Room Management (`eagle-secretaire-principale-v2.tsx`)
**Features:**
- Specialty-based waiting rooms
- Patient drag-and-drop reassignment
- Urgency level adjustment
- Specialty merging
- Load balancing visualization
- Patient details panel
- Center-based filtering

**Key Functions:**
- `handleDragStart()`: Start patient drag
- `handleDrop()`: Reassign patient to doctor
- `handleAdjustUrgency()`: Adjust patient urgency
- `handleMergeSpecialties()`: Merge waiting rooms

#### F. Performance Dashboard (`eagle-dashboard-principal.tsx`)
**Features:**
- Multi-center performance metrics
- Chart visualizations (Bar, Line, Area, Pie)
- Time period filters (24h, 7d, 30d)
- Center comparison
- Export functionality (PDF, Excel, Charts)
- Custom tooltips

**Charts:**
- Waiting time per center
- Patient flow by hour
- Urgency distribution by specialty
- Weekly trends

### 5. Technical Stack

**Core Technologies:**
- **React** (with TypeScript/TSX)
- **Next.js** (for routing and SSR)
- **Tailwind CSS** (utility-first styling)
- **Lucide React** (icon library)
- **Recharts** (chart library)

**Key Dependencies:**
```json
{
  "react": "^19.2.1",
  "react-dom": "^19.2.1",
  "next": "^16.0.10",
  "lucide-react": "^0.561.0",
  "recharts": "^2.15.4",
  "tailwindcss": "^4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

### 6. Data Models

#### Center Model
```typescript
interface Center {
  id: number;
  name: string;
  code: string; // e.g., "CSJ-YDE"
  type: "Centre Principal" | "Centre Secondaire";
  status: "online" | "offline";
  bandwidth: number; // Mbps
  waitingPatients: number;
  consultants: number;
  alertLevel: "normal" | "warning" | "issue";
  trend: "up" | "down" | "stable";
  lastUpdate: string;
  location: { lat: number; lng: number };
  statistics: {
    waitTimeTrend: number[];
    patientsTrend: number[];
  };
}
```

#### Patient Model
```typescript
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: "M" | "F";
  assignedUrgency: number; // 1-5
  adjustedUrgency?: number;
  center: number;
  secretary: number;
  time: string; // "HH:MM"
  status: "pending" | "validated" | "adjusted";
  reason: string;
  vitalSigns: {
    bp: string; // "160/95"
    hr: number; // bpm
    temp: number; // Celsius
    spo2: number; // percentage
    pain: number; // 1-10
  };
  notes: string;
  medicalHistory: string[];
}
```

#### Consultant Model
```typescript
interface Consultant {
  id: number;
  name: string;
  specialty: string;
  avatar: string; // Initials
  color: string; // Tailwind color class
  availability: number; // percentage
  patients: number;
  avgConsultation: number; // minutes
  workDays: number[]; // [1,2,3,4,5] for Mon-Fri
  status: "En consultation" | "Disponible" | "En pause";
  center: string;
  since: string; // "HH:MM"
  statistics: {
    patientsTrend: number[];
    consultationTimeTrend: number[];
  };
}
```

#### Message Model
```typescript
interface Message {
  id: number;
  sender: string;
  time: string;
  content: string;
  isUrgent: boolean;
  isOutgoing: boolean;
  priority?: number; // 1-5
  tags?: string[];
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentType?: "pdf" | "excel" | "image" | "video";
  isPinned?: boolean;
}
```

### 7. Keyboard Shortcuts

**Global Shortcuts:**
- `Alt+D`: Dashboard
- `Alt+W`: Waiting Rooms
- `Alt+U`: Urgency Validation
- `Alt+C`: Consultants
- `Alt+M`: Messaging
- `Alt+P`: Performance
- `Alt+T`: Technical Monitoring
- `Alt+Z`: Zen Mode
- `Alt+S`: Toggle Stats View
- `Alt+N`: Notifications
- `Alt+H`: Help/Shortcuts
- `Esc`: Close active modal/panel
- `Ctrl+F`: Focus search
- `Ctrl+N`: New item (context-dependent)

**Implementation Pattern:**
```typescript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.altKey) {
      switch(e.key.toLowerCase()) {
        case 'd': setActiveNav('dashboard'); break;
        case 'w': setActiveNav('waitingRooms'); break;
        // ... more shortcuts
      }
    } else if (e.key === 'Escape') {
      // Close modals
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 8. Component Patterns

#### Modal Pattern
```typescript
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-96 p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Modal Title</h3>
        <button onClick={() => setShowModal(false)}>
          <X size={18} />
        </button>
      </div>
      {/* Modal content */}
    </div>
  </div>
)}
```

#### Stats Card Pattern
```typescript
<div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <div className="flex items-start justify-between">
    <div className={`p-2 rounded-full ${getColorClass(color)}`}>
      {icon}
    </div>
    <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
      {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span className="ml-1">{Math.abs(trend)}%</span>
    </div>
  </div>
  <div className="mt-2">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}{unit}</p>
  </div>
</div>
```

#### Filter Menu Pattern
```typescript
<div className="relative">
  <button onClick={() => setShowFiltersMenu(!showFiltersMenu)}>
    Filters <ChevronDown size={14} />
  </button>
  {showFiltersMenu && (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setShowFiltersMenu(false)}></div>
      <div className="absolute right-0 bottom-full mb-1 w-72 bg-white rounded-md shadow-lg z-20">
        {/* Filter content */}
      </div>
    </>
  )}
</div>
```

### 9. Helper Functions

#### Color Utilities
```typescript
const getUrgencyColor = (level: number): string => {
  const colors = {
    1: "bg-green-500",
    2: "bg-blue-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
    5: "bg-red-500"
  };
  return colors[level] || "bg-gray-500";
};

const getUrgencyText = (level: number): string => {
  const texts = {
    1: "Non urgent",
    2: "Peu urgent",
    3: "Urgent",
    4: "Très urgent",
    5: "Critique"
  };
  return texts[level] || "Inconnu";
};
```

#### Status Utilities
```typescript
const getStatusClass = (status: string): string => {
  const classes = {
    "pending": "bg-blue-100 text-blue-800",
    "validated": "bg-green-100 text-green-800",
    "adjusted": "bg-yellow-100 text-yellow-800",
    "online": "bg-green-100 text-green-800",
    "offline": "bg-red-100 text-red-800"
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};
```

### 10. Development Guidelines

#### Code Organization
1. **Component Structure**: One main component per page/module
2. **State Management**: Keep state local to components, lift only when necessary
3. **Helper Functions**: Define utility functions at component level or in separate utils file
4. **Data**: Mock data defined as constants at component top level

#### Styling Guidelines
1. **Use Tailwind Classes**: Prefer utility classes over custom CSS
2. **Dark Mode**: Always support dark mode with conditional classes
3. **Responsive Design**: Use Tailwind breakpoints (`md:`, `lg:`, `xl:`)
4. **Consistent Spacing**: Use Tailwind spacing scale (2, 4, 6, 8, etc.)

#### Accessibility
1. **Keyboard Navigation**: All interactive elements should be keyboard accessible
2. **ARIA Labels**: Add appropriate ARIA labels for screen readers
3. **Focus Management**: Manage focus in modals and dynamic content
4. **Color Contrast**: Ensure sufficient contrast for text readability

#### Performance
1. **Lazy Loading**: Use React.lazy for code splitting
2. **Memoization**: Use React.memo for expensive components
3. **Virtual Scrolling**: Implement for long lists (100+ items)
4. **Debouncing**: Debounce search and filter inputs

### 11. Feature Implementation Checklist

#### Core Features
- [ ] Sidebar navigation with collapse/expand
- [ ] Dark mode toggle
- [ ] Responsive layout
- [ ] Keyboard shortcuts
- [ ] Search functionality
- [ ] Filter system
- [ ] Notification system
- [ ] User profile dropdown

#### Dashboard Module
- [ ] Network statistics cards
- [ ] Center status monitoring
- [ ] Active consultants list
- [ ] Pending urgency validations
- [ ] Recent activity timeline
- [ ] Contextual tabs (Overview/Map/Favorites)

#### Urgency Validation Module
- [ ] Patient list with filters
- [ ] Urgency level adjustment (1-5)
- [ ] Validation workflow
- [ ] Comment system
- [ ] Patient details panel
- [ ] Force priority override

#### Consultant Management Module
- [ ] Weekly/monthly calendar view
- [ ] Drag-and-drop scheduling
- [ ] Availability management
- [ ] Conflict detection
- [ ] Absence tracking
- [ ] Template system
- [ ] Filter favorites

#### Communication Module
- [ ] Clinic list with status
- [ ] Real-time messaging
- [ ] Message templates
- [ ] File attachments
- [ ] Urgent message flagging
- [ ] Message pinning
- [ ] Tag system
- [ ] Agent selection

#### Waiting Room Module
- [ ] Specialty-based rooms
- [ ] Patient drag-and-drop
- [ ] Urgency adjustment
- [ ] Specialty merging
- [ ] Load visualization
- [ ] Patient details

#### Performance Module
- [ ] Multi-center metrics
- [ ] Chart visualizations
- [ ] Time period filters
- [ ] Export functionality
- [ ] Custom tooltips

### 12. Testing Considerations

#### Unit Tests
- Helper functions (color utilities, status utilities)
- Data transformations
- Filter logic
- Sort algorithms

#### Integration Tests
- Modal open/close flows
- Form submissions
- Drag-and-drop operations
- Navigation flows

#### E2E Tests
- Complete user workflows
- Multi-step processes (urgency validation, consultant assignment)
- Cross-module interactions

### 13. Deployment Considerations

#### Environment Variables
- API endpoints
- WebSocket URLs
- Feature flags
- Analytics keys

#### Build Optimization
- Code splitting by route
- Image optimization
- Bundle size monitoring
- Performance budgets

#### Monitoring
- Error tracking (Sentry, etc.)
- Performance monitoring
- User analytics
- Uptime monitoring

## Development Prompt Template

Use this template when requesting new features:

```
I need to implement [FEATURE_NAME] for the EAGLE Principal Secretary Dashboard.

Requirements:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Design Specifications:
- Follow the existing component patterns
- Support dark mode
- Include keyboard shortcuts
- Add appropriate filters/search
- Include status indicators
- Follow the color system for urgency/status

Technical Requirements:
- Use React hooks for state management
- Use Tailwind CSS for styling
- Use Lucide React for icons
- Follow the existing data models
- Include proper error handling
- Add loading states

Expected Behavior:
- [Describe expected user flow]
- [Describe expected interactions]
- [Describe expected visual feedback]
```

## Conclusion

This development guide provides a comprehensive foundation for building and extending the EAGLE Principal Secretary Dashboard. Follow these patterns, guidelines, and best practices to ensure consistency, maintainability, and user experience across all modules.

For questions or clarifications, refer to the existing codebase examples in:
- `sec-principal-dashboard.tsx` (Main dashboard)
- `eagle-urgency-validation.tsx` (Urgency validation)
- `secretaire-principale-interface-amelioree.tsx` (Consultant management)
- `eagle-interclinic-communication.tsx` (Communication)
- `eagle-secretaire-principale-v2.tsx` (Waiting rooms)
- `eagle-dashboard-principal.tsx` (Performance)



