import { useState, useMemo } from "react";

interface UsePaginationOptions {
    pageSize?: number;
    initialPage?: number;
}

interface UsePaginationResult<T> {
    /** Items for the current page */
    paginatedItems: T[];
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items */
    totalItems: number;
    /** Whether there is a next page */
    hasNextPage: boolean;
    /** Whether there is a previous page */
    hasPreviousPage: boolean;
    /** Go to next page */
    nextPage: () => void;
    /** Go to previous page */
    previousPage: () => void;
    /** Go to a specific page */
    goToPage: (page: number) => void;
    /** Items per page */
    pageSize: number;
    /** Change the page size */
    setPageSize: (size: number) => void;
}

/**
 * Client-side pagination hook.
 * Accepts a full list of items and returns a paginated subset.
 */
export function usePagination<T>(
    items: T[],
    options: UsePaginationOptions = {}
): UsePaginationResult<T> {
    const { pageSize: initialPageSize = 10, initialPage = 1 } = options;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Reset to page 1 when items change significantly
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safeCurrentPage, pageSize]);

    return {
        paginatedItems,
        currentPage: safeCurrentPage,
        totalPages,
        totalItems,
        hasNextPage: safeCurrentPage < totalPages,
        hasPreviousPage: safeCurrentPage > 1,
        nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
        previousPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
        goToPage: (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)),
        pageSize,
        setPageSize: (size: number) => {
            setPageSize(size);
            setCurrentPage(1);
        },
    };
}
