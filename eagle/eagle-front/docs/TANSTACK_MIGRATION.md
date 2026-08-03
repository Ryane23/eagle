# TanStack Query Migration - Complete ✅

## Overview

The codebase has been migrated from Zustand-only state management to a hybrid approach:
- **TanStack Query** - All server state (API data)
- **Zustand** - Client state only (auth, UI)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Components                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Server State                    Client State           │
│   ──────────────                  ────────────           │
│   TanStack Query                  Zustand                │
│   hooks/queries/*                 stores/                │
│                                                          │
│   • usePatientsQuery              • useAuthStore         │
│   • useConsultationsQuery         • useUIStore           │
│   • usePrescriptionsQuery                                │
│   • useUrgenciesQuery                                    │
│   • useQueueQuery                                        │
│   • useNotificationsQuery                                │
│   • useUsersQuery                                        │
│   • useHospitalsQuery                                    │
│   • useComplaintsQuery                                   │
│   • useReportsQuery                                      │
│   • useMessagesQuery                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Files Structure

```
hooks/
├── queries/
│   ├── index.ts                    # All exports
│   ├── use-patients-query.ts       # Patients CRUD
│   ├── use-consultations-query.ts  # Consultations
│   ├── use-prescriptions-query.ts  # Prescriptions
│   ├── use-urgencies-query.ts      # Urgencies
│   ├── use-queue-query.ts          # Queue management
│   ├── use-notifications-query.ts  # Notifications
│   ├── use-reports-query.ts        # Medical reports
│   ├── use-messages-query.ts       # Chat messages
│   ├── use-users-query.ts          # Users (admin)
│   ├── use-hospitals-query.ts      # Hospitals (admin)
│   ├── use-analytics-query.ts      # Analytics
│   ├── use-complaints-query.ts     # Complaints
│   ├── use-system-query.ts         # System settings
│   └── use-doctor-dashboard-query.ts # Dashboard combined

providers/
├── query-provider.tsx              # TanStack QueryClient

stores/
├── index.ts                        # Store exports
├── auth-store.ts                   # Auth (client state)
├── ui-store.ts                     # UI (client state)
└── *-store.ts                      # Legacy (deprecated)
```

## Usage Examples

### Fetching Data

```tsx
import { usePatientsQuery, usePatientStats } from "@/hooks/queries";

function PatientsPage() {
    const { data: patients, isLoading, error, refetch } = usePatientsQuery();
    const stats = usePatientStats();

    if (isLoading) return <Skeleton />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <p>Total patients: {stats.total}</p>
            {patients?.map(patient => (
                <PatientCard key={patient.id} {...patient} />
            ))}
        </div>
    );
}
```

### Mutations with Optimistic Updates

```tsx
import { useCreatePatient, useDeletePatient } from "@/hooks/queries";

function PatientActions() {
    const createMutation = useCreatePatient();
    const deleteMutation = useDeletePatient();

    const handleCreate = () => {
        createMutation.mutate({
            firstName: "John",
            lastName: "Doe",
            // ...
        });
    };

    const handleDelete = (id: string) => {
        // Optimistic update - UI updates immediately, rolls back on error
        deleteMutation.mutate(id);
    };

    return (
        <div>
            <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending}
            >
                {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
        </div>
    );
}
```

### Manual Cache Invalidation

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { patientKeys } from "@/hooks/queries";

function RefreshButton() {
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        // Invalidate all patient queries
        queryClient.invalidateQueries({ queryKey: patientKeys.all });
    };

    return <Button onClick={handleRefresh}>Refresh</Button>;
}
```

### Client State (Zustand)

```tsx
import { useAuthStore, useUIStore } from "@/stores";

function Header() {
    const { user, logout } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <header>
            <Button onClick={toggleSidebar}>
                {sidebarOpen ? "Close" : "Open"}
            </Button>
            <span>{user?.name}</span>
            <Button onClick={logout}>Logout</Button>
        </header>
    );
}
```

## Benefits

| Feature | Before (Zustand) | After (TanStack Query) |
|---------|------------------|------------------------|
| Caching | Manual | Automatic (30s-5min) |
| Deduplication | None | Automatic |
| Background refresh | Manual | On window focus |
| Optimistic updates | Manual | Built-in with rollback |
| Loading states | Per-store | Per-query |
| DevTools | None | Full debugging panel |
| Request retry | None | Configurable (2x default) |

## DevTools

In development, a floating button appears at the bottom-left corner.
Click to open TanStack Query DevTools to:
- View all active queries and their state
- Inspect cached data
- Trigger manual refetches
- View query timings

## Migrated Pages

### Doctor Dashboard
- ✅ `/doctor` - Main dashboard
- ✅ `/doctor/patients` - Patient management
- ✅ `/doctor/schedule` - Schedule view
- ✅ `/doctor/prescriptions` - Prescriptions
- ✅ `/doctor/notifications` - Notifications
- ✅ `/doctor/reports` - Medical reports
- ✅ `/doctor/messages` - Chat
- ✅ `/doctor/statistics` - Statistics
- ✅ `/doctor/emergencies` - Emergencies
- ✅ `/doctor/waiting-room` - Waiting room
- ✅ `/doctor/consultation` - Video consultation

### Admin Dashboard
- ✅ `/admin/users` - User management
- ✅ `/admin/hospitals` - Hospital management
- ✅ `/admin/incidents` - Incident management

## Default Query Options

```typescript
// providers/query-provider.tsx
{
    queries: {
        staleTime: 30 * 1000,      // 30 seconds fresh
        gcTime: 5 * 60 * 1000,     // 5 minute cache
        retry: 2,                  // Retry twice
        refetchOnWindowFocus: true, // Auto-refresh
    },
    mutations: {
        retry: 1,
    }
}
```

## Query Keys Pattern

All query keys follow a consistent pattern:

```typescript
export const patientKeys = {
    all: ["patients"],                           // All patient queries
    lists: () => [...patientKeys.all, "list"],
    list: (filters) => [...patientKeys.lists(), filters],
    details: () => [...patientKeys.all, "detail"],
    detail: (id) => [...patientKeys.details(), id],
    ehr: (id) => [...patientKeys.all, "ehr", id],
};
```

This allows granular invalidation:
- `patientKeys.all` - Invalidate everything
- `patientKeys.lists()` - Invalidate all lists
- `patientKeys.detail(id)` - Invalidate specific patient

