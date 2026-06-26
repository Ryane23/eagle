# Store & API Optimization Guide

## Current Issues Identified

### 1. **Redundant API Calls**
- Every page mount triggers a fresh API call
- No caching between page navigations
- Concurrent duplicate requests (e.g., multiple components fetching same data)

### 2. **Poor Loading UX**
- Full loading states on every visit
- No stale-while-revalidate pattern
- Users see spinners even for cached data

### 3. **Inefficient Re-renders**
- Stores update entire state objects
- Components re-render on any state change
- No selector optimization

### 4. **No Request Cancellation**
- Stale requests complete and overwrite newer data
- Memory leaks from abandoned requests

### 5. **Persistence Issues**
- No selective persistence
- Large data structures persisted unnecessarily
- No TTL for cached data

---

## Optimization Solutions

### 1. Request Deduplication

**Problem:** Multiple components request the same data simultaneously.

**Solution:** Use `dedupeRequest` from `lib/store-utils.ts`:

```typescript
import { dedupeRequest } from "@/lib/store-utils";

// Instead of:
const data = await getPrescriptions();

// Use:
const data = await dedupeRequest("prescriptions", getPrescriptions);
```

This ensures only one API call is made even if 5 components request prescriptions simultaneously.

---

### 2. Caching with TTL

**Problem:** Data is fetched on every page visit.

**Solution:** Use cache utilities:

```typescript
import { getCached, setCache, invalidateCache } from "@/lib/store-utils";

// Check cache first
const cached = getCached<Prescription[]>("prescriptions");
if (cached) {
    return cached; // Return immediately
}

// Fetch and cache
const data = await getPrescriptions();
setCache("prescriptions", data, 60000); // Cache for 1 minute

// Invalidate on mutation
invalidateCache("prescriptions");
```

---

### 3. Stale-While-Revalidate Pattern

**Problem:** Users see loading spinners while waiting for fresh data.

**Solution:** Show cached data immediately, fetch fresh in background:

```typescript
import { fetchWithSWR } from "@/lib/store-utils";

const { data, isStale, isLoading } = await fetchWithSWR(
    "prescriptions",
    getPrescriptions,
    {
        staleTime: 30000, // Data is "fresh" for 30 seconds
        cacheTime: 300000, // Cache expires after 5 minutes
        onSuccess: (freshData) => set({ prescriptions: freshData }),
    }
);

// Show cached data with "Updating..." indicator if stale
```

---

### 4. Optimistic Updates

**Problem:** UI waits for API response before updating.

**Solution:** Update UI immediately, rollback on error:

```typescript
// Save original for rollback
const original = state.prescriptions.find(p => p.id === id);

// Optimistic update
set(state => ({
    prescriptions: state.prescriptions.map(p => 
        p.id === id ? { ...p, status: "dispensed" } : p
    )
}));

try {
    await apiUpdatePrescription(id, { status: "dispensed" });
} catch (error) {
    // Rollback on failure
    set(state => ({
        prescriptions: state.prescriptions.map(p => 
            p.id === id ? original : p
        )
    }));
}
```

---

### 5. Granular Loading States

**Problem:** Single `isLoading` boolean causes entire UI to show loading.

**Solution:** Use granular loading states:

```typescript
type State = {
    isLoadingList: boolean;    // List is loading
    isLoadingDetail: boolean;  // Single item loading
    isMutating: boolean;       // Create/update/delete in progress
};

// In components:
const isLoadingList = useStore(state => state.isLoadingList);
// Only show skeleton for list, not entire page
```

---

### 6. Selector Optimization

**Problem:** Components re-render on any store change.

**Solution:** Use fine-grained selectors:

```typescript
// ❌ Bad: Re-renders on ANY state change
const { prescriptions, isLoading, error, filters } = usePrescriptionsStore();

// ✅ Good: Only re-renders when prescriptions change
const prescriptions = usePrescriptionsStore(state => state.prescriptions);
const isLoading = usePrescriptionsStore(state => state.isLoadingList);
```

**Even Better:** Use `subscribeWithSelector` middleware for computed values:

```typescript
import { subscribeWithSelector } from "zustand/middleware";

const useStore = create()(
    subscribeWithSelector((set, get) => ({
        // ...
    }))
);

// Computed selector
const activePrescriptions = usePrescriptionsStore(
    state => state.prescriptions.filter(p => p.status === "active")
);
```

---

### 7. Debounced Search

**Problem:** Every keystroke triggers an API call.

**Solution:** Debounce search input:

```typescript
import { debounceAction } from "@/lib/store-utils";

// In store
setSearchFilter: debounceAction<[string]>(
    "prescription-search",
    (search) => {
        set(state => ({ filters: { ...state.filters, search } }));
        // Optional: trigger filtered fetch
    },
    300 // Wait 300ms after last keystroke
),
```

---

### 8. Selective Persistence

**Problem:** Entire store is persisted, including loading states.

**Solution:** Persist only what's needed:

```typescript
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create()(
    persist(
        (set, get) => ({ /* ... */ }),
        {
            name: "prescriptions-storage",
            storage: createJSONStorage(() => localStorage),
            // Only persist these fields
            partialize: (state) => ({
                filters: state.filters,
                // Don't persist: prescriptions, isLoading, error
            }),
        }
    )
);
```

---

### 9. Request Abortion

**Problem:** Old requests complete after newer ones, causing stale data.

**Solution:** Use AbortController:

```typescript
// In lib/api-client.ts
let abortController: AbortController | null = null;

export async function fetchWithAbort<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    // Cancel previous request
    if (abortController) {
        abortController.abort();
    }
    
    abortController = new AbortController();
    
    const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
    });
    
    return response.json();
}
```

---

## Implementation Priority

### Phase 1: Quick Wins (High Impact, Low Effort)
1. ✅ Add request deduplication to all fetch actions
2. ✅ Implement caching with TTL
3. ✅ Split loading states (list vs detail vs mutation)

### Phase 2: UX Improvements
4. ⏳ Add optimistic updates to mutations
5. ⏳ Implement stale-while-revalidate
6. ⏳ Add debounced search to all list pages

### Phase 3: Performance Polish
7. ⏳ Optimize selectors with subscribeWithSelector
8. ⏳ Add selective persistence
9. ⏳ Implement request abortion

---

## Files Reference

| File | Purpose |
|------|---------|
| `lib/store-utils.ts` | Shared utilities for all stores |
| `stores/prescriptions-store-optimized.ts` | Example optimized store pattern |

---

## Migration Guide

To migrate an existing store:

1. **Import utilities:**
```typescript
import { dedupeRequest, getCached, setCache, invalidateCache } from "@/lib/store-utils";
```

2. **Add metadata to state:**
```typescript
lastFetched: number | null;
isStale: boolean;
```

3. **Update fetch actions:**
```typescript
fetchItems: async (force = false) => {
    // Skip if fresh data exists
    if (!force) {
        const cached = getCached<Item[]>(CACHE_KEY);
        if (cached && !get().isStale) return;
    }
    
    // Dedupe and cache
    const data = await dedupeRequest(CACHE_KEY, getItems);
    setCache(CACHE_KEY, data, CACHE_TTL);
    
    set({ items: data, lastFetched: Date.now(), isStale: false });
}
```

4. **Add invalidation to mutations:**
```typescript
createItem: async (data) => {
    const item = await apiCreateItem(data);
    set(state => ({ items: [item, ...state.items], isStale: true }));
    invalidateCache(CACHE_KEY);
    return item;
}
```

5. **Update component selectors:**
```typescript
// Before
const store = useStore();

// After
const items = useStore(state => state.items);
const isLoading = useStore(state => state.isLoadingList);
```

---

## Performance Metrics to Track

After implementing optimizations, monitor:

1. **API call reduction:** Should see 50-70% fewer duplicate calls
2. **Time to interactive:** Cached pages should load instantly
3. **Re-render count:** Use React DevTools Profiler
4. **Bundle size:** Ensure utilities don't bloat the bundle

---

---

## TanStack Query Integration (Recommended)

TanStack Query is now installed and configured. Here's the recommended architecture:

### Architecture: Zustand + TanStack Query

| Concern | Use |
|---------|-----|
| **Server state** (API data) | TanStack Query |
| **Client state** (UI state, forms) | Zustand |
| **Global client state** (auth, theme) | Zustand with persist |

### Usage Example

```tsx
import { usePrescriptionsQuery, useCreatePrescription } from "@/hooks/queries";

function PrescriptionsPage() {
    // Server state - TanStack Query handles caching, refetching, etc.
    const { data, isLoading, error, refetch } = usePrescriptionsQuery();
    const createMutation = useCreatePrescription();

    // Client state - Zustand for UI
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (isLoading) return <Skeleton />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            {data?.map(rx => (
                <PrescriptionCard 
                    key={rx.id} 
                    {...rx}
                    selected={rx.id === selectedId}
                    onSelect={() => setSelectedId(rx.id)}
                />
            ))}
            <Button 
                onClick={() => createMutation.mutate(newData)}
                disabled={createMutation.isPending}
            >
                {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
        </div>
    );
}
```

### Query Keys Convention

All query keys follow this pattern for easy invalidation:

```typescript
export const prescriptionKeys = {
    all: ["prescriptions"],                    // All prescription queries
    lists: () => [...prescriptionKeys.all, "list"],
    list: (filters) => [...prescriptionKeys.lists(), filters],
    details: () => [...prescriptionKeys.all, "detail"],
    detail: (id) => [...prescriptionKeys.details(), id],
};

// Invalidate all prescription queries:
queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });

// Invalidate only lists:
queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });

// Invalidate specific item:
queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(id) });
```

### DevTools

TanStack Query DevTools are enabled in development mode.
Open the floating button (bottom-left) to:
- See all active queries
- Inspect cache data
- Trigger refetches manually
- View query timings

### Files Reference

| File | Purpose |
|------|---------|
| `providers/query-provider.tsx` | QueryClient setup with defaults |
| `hooks/queries/index.ts` | All query hook exports |
| `hooks/queries/use-prescriptions-query.ts` | Example query implementation |

### Migration Path

1. Keep existing Zustand stores for client state
2. Create query hooks in `hooks/queries/` for server state
3. Gradually migrate pages to use query hooks
4. Remove server state from Zustand stores once migrated

---

## Next Steps

1. ✅ TanStack Query installed and configured
2. ⏳ Create query hooks for remaining resources (patients, consultations, etc.)
3. ⏳ Migrate pages to use query hooks
4. ⏳ Clean up redundant Zustand server state

