"use client";

/**
 * Skip navigation link for keyboard/screen reader users.
 * Include at the very top of the page layout.
 */
export function SkipNav() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:border focus:rounded-md focus:shadow-sm focus:text-sm"
        >
            Aller au contenu principal
        </a>
    );
}
