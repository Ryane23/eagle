/**
 * Store utilities for optimized data fetching and caching
 */

// ============================================================================
// Request Deduplication
// ============================================================================

type PendingRequest = {
    promise: Promise<unknown>;
    timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();
const DEDUP_WINDOW_MS = 1000; // Don't re-fetch within 1 second

/**
 * Deduplicate concurrent API requests
 * If the same request is made within the dedup window, return the pending promise
 */
export async function dedupeRequest<T>(
    key: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    const now = Date.now();
    const pending = pendingRequests.get(key);

    // If there's a pending request within the window, return it
    if (pending && now - pending.timestamp < DEDUP_WINDOW_MS) {
        return pending.promise as Promise<T>;
    }

    // Create new request
    const promise = fetchFn();
    pendingRequests.set(key, { promise, timestamp: now });

    try {
        const result = await promise;
        return result;
    } finally {
        // Clean up after request completes
        setTimeout(() => {
            const current = pendingRequests.get(key);
            if (current?.timestamp === now) {
                pendingRequests.delete(key);
            }
        }, DEDUP_WINDOW_MS);
    }
}

// ============================================================================
// Cache with TTL
// ============================================================================

type CacheEntry<T> = {
    data: T;
    timestamp: number;
    ttl: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data if still valid
 */
export function getCached<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

/**
 * Set cached data with TTL
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
    });
}

/**
 * Invalidate cache by key or pattern
 */
export function invalidateCache(keyOrPattern: string | RegExp): void {
    if (typeof keyOrPattern === "string") {
        cache.delete(keyOrPattern);
    } else {
        for (const key of cache.keys()) {
            if (keyOrPattern.test(key)) {
                cache.delete(key);
            }
        }
    }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
    cache.clear();
}

// ============================================================================
// Stale-While-Revalidate Pattern
// ============================================================================

type SWROptions = {
    /** Time in ms before data is considered stale (default: 30s) */
    staleTime?: number;
    /** Time in ms before cache is invalidated (default: 5min) */
    cacheTime?: number;
    /** Callback when fresh data is available */
    onSuccess?: (data: unknown) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
};

/**
 * Stale-while-revalidate: Return cached data immediately, then revalidate in background
 */
export async function fetchWithSWR<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: SWROptions = {}
): Promise<{ data: T | null; isStale: boolean; isLoading: boolean }> {
    const { staleTime = 30000, cacheTime = 300000, onSuccess, onError } = options;

    const cached = getCached<T>(key);
    const cacheEntry = cache.get(key) as CacheEntry<T> | undefined;
    const isStale = cacheEntry ? Date.now() - cacheEntry.timestamp > staleTime : true;

    // If we have cached data and it's not stale, return it
    if (cached && !isStale) {
        return { data: cached, isStale: false, isLoading: false };
    }

    // If we have stale data, return it and revalidate in background
    if (cached && isStale) {
        // Revalidate in background
        fetchFn()
            .then((freshData) => {
                setCache(key, freshData, cacheTime);
                onSuccess?.(freshData);
            })
            .catch((error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            });

        return { data: cached, isStale: true, isLoading: true };
    }

    // No cached data, fetch fresh
    try {
        const data = await fetchFn();
        setCache(key, data, cacheTime);
        onSuccess?.(data);
        return { data, isStale: false, isLoading: false };
    } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return { data: null, isStale: false, isLoading: false };
    }
}

// ============================================================================
// Optimistic Updates
// ============================================================================

type OptimisticUpdateOptions<T, R> = {
    /** Current state */
    currentData: T[];
    /** Optimistic update to apply immediately */
    optimisticUpdate: (data: T[]) => T[];
    /** API call to execute */
    apiCall: () => Promise<R>;
    /** How to update state on success */
    onSuccess: (data: T[], result: R) => T[];
    /** Rollback function on error */
    onRollback: (data: T[]) => void;
};

/**
 * Perform optimistic update with rollback on failure
 */
export async function optimisticUpdate<T, R>({
    currentData,
    optimisticUpdate: applyOptimistic,
    apiCall,
    onSuccess,
    onRollback,
}: OptimisticUpdateOptions<T, R>): Promise<{ success: boolean; data: T[] }> {
    // Store original data for rollback
    const originalData = [...currentData];

    // Apply optimistic update
    const optimisticData = applyOptimistic(currentData);

    try {
        const result = await apiCall();
        const finalData = onSuccess(optimisticData, result);
        return { success: true, data: finalData };
    } catch {
        // Rollback on error
        onRollback(originalData);
        return { success: false, data: originalData };
    }
}

// ============================================================================
// Pagination Helpers
// ============================================================================

export type PaginationState = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: PaginationState;
};

/**
 * Create initial pagination state
 */
export function createPaginationState(pageSize: number = 20): PaginationState {
    return {
        page: 1,
        pageSize,
        total: 0,
        totalPages: 0,
    };
}

/**
 * Calculate pagination from response
 */
export function calculatePagination(
    total: number,
    page: number,
    pageSize: number
): PaginationState {
    return {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    };
}

// ============================================================================
// Selector Helpers (for Zustand)
// ============================================================================

/**
 * Create a memoized selector that only triggers re-renders when selected data changes
 * Usage: const selectUser = createSelector((state) => state.user);
 */
export function createSelector<T, R>(selector: (state: T) => R) {
    let lastResult: R;
    let lastState: T;

    return (state: T): R => {
        if (state === lastState) {
            return lastResult;
        }

        const result = selector(state);

        // Shallow compare for objects/arrays
        if (
            typeof result === "object" &&
            result !== null &&
            typeof lastResult === "object" &&
            lastResult !== null
        ) {
            const keys1 = Object.keys(result);
            const keys2 = Object.keys(lastResult as object);

            if (
                keys1.length === keys2.length &&
                keys1.every(
                    (key) =>
                        (result as Record<string, unknown>)[key] ===
                        (lastResult as Record<string, unknown>)[key]
                )
            ) {
                return lastResult;
            }
        }

        lastState = state;
        lastResult = result;
        return result;
    };
}

// ============================================================================
// Debounced Actions
// ============================================================================

const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Debounce a function by key
 */
export function debounceAction<TArgs extends unknown[]>(
    key: string,
    fn: (...args: TArgs) => void,
    delay: number = 300
): (...args: TArgs) => void {
    return (...args: TArgs) => {
        const existing = debounceTimers.get(key);
        if (existing) {
            clearTimeout(existing);
        }

        const timer = setTimeout(() => {
            fn(...args);
            debounceTimers.delete(key);
        }, delay);

        debounceTimers.set(key, timer);
    };
}

/**
 * Cancel a debounced action
 */
export function cancelDebounce(key: string): void {
    const timer = debounceTimers.get(key);
    if (timer) {
        clearTimeout(timer);
        debounceTimers.delete(key);
    }
}

