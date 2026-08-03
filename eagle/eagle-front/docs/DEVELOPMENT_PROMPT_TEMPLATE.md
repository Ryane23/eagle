# EAGLE Principal Secretary - Quick Development Prompt

## System Context

EAGLE is a healthcare management system for coordinating multiple medical centers. The Principal Secretary Dashboard serves as the central hub for:
- Network-wide patient management
- Consultant scheduling and coordination
- Urgency level validation
- Inter-clinic communication
- Performance monitoring

## Quick Reference

### Tech Stack
- **React 19** + **TypeScript/TSX**
- **Next.js 16** (routing)
- **Tailwind CSS 4** (styling)
- **Lucide React** (icons)
- **Recharts** (charts)

### Design Patterns

**Layout:**
```
Sidebar (collapsible) | Header | Main Content
```

**Color System:**
- Urgency: Green(1) → Blue(2) → Yellow(3) → Orange(4) → Red(5)
- Status: Green(online) / Red(offline) / Yellow(warning) / Blue(normal)

**Component Pattern:**
```tsx
const Component = () => {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      {/* Header */}
      {/* Content */}
    </div>
  );
};
```

### Key Modules

1. **Dashboard** - Network overview, stats, centers, consultants
2. **Urgency Validation** - Validate/adjust patient urgency levels (1-5)
3. **Consultant Management** - Schedule, availability, conflicts
4. **Communication** - Inter-clinic messaging with templates
5. **Waiting Rooms** - Specialty-based patient queues
6. **Performance** - Analytics, charts, metrics

### Common Patterns

**Modal:**
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-96 p-4">
      {/* Content */}
    </div>
  </div>
)}
```

**Stats Card:**
```tsx
<div className="p-4 rounded-lg shadow bg-white">
  <div className="flex items-start justify-between">
    <div className="p-2 rounded-full bg-blue-100">{icon}</div>
    <TrendingUp size={14} className="text-green-500" />
  </div>
  <p className="text-sm text-gray-500">{label}</p>
  <p className="text-2xl font-bold">{value}</p>
</div>
```

**Keyboard Shortcuts:**
- `Alt+D` = Dashboard
- `Alt+W` = Waiting Rooms
- `Alt+U` = Urgency Validation
- `Alt+C` = Consultants
- `Alt+M` = Messaging
- `Esc` = Close modal

## Development Request Template

```
Implement [FEATURE] for the Principal Secretary Dashboard.

Functionality:
- [What it should do]
- [User interactions]
- [Data requirements]

Design:
- Follow existing patterns
- Support dark mode
- Include keyboard shortcuts
- Use urgency color system (1-5)
- Add status indicators

Technical:
- React hooks for state
- Tailwind CSS styling
- Lucide React icons
- Include loading/error states
- Add filters/search if applicable

Reference:
- Similar to [existing module/component]
- Follow [specific pattern from guide]
```

## Data Models Quick Reference

**Patient:**
```typescript
{
  id: number;
  name: string;
  age: number;
  urgency: 1-5;
  center: string;
  vitalSigns: { bp, hr, temp, spo2, pain };
}
```

**Center:**
```typescript
{
  id: number;
  name: string;
  code: string; // "CSJ-YDE"
  status: "online" | "offline";
  waitingPatients: number;
}
```

**Consultant:**
```typescript
{
  id: number;
  name: string;
  specialty: string;
  availability: number; // %
  status: "En consultation" | "Disponible" | "En pause";
}
```

## Quick Implementation Checklist

- [ ] Component structure with sidebar + header + content
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Search/filter functionality
- [ ] Status indicators (online/offline)
- [ ] Urgency color coding (if applicable)
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design
- [ ] Accessibility (keyboard nav, ARIA labels)



