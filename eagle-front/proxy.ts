import { NextRequest, NextResponse } from "next/server";

// Role to dashboard path mapping (lowercase to match API response)
const roleDashboardPaths: Record<string, string> = {
    admin: "/admin",
    primary_secretary: "/dashboard/primary",
    secondary_secretary: "/dashboard/secondary",
    doctor: "/dashboard/doctor",
    nurse: "/dashboard/nurse",
};

// Role-based access control paths
const roleAllowedPaths: Record<string, string[]> = {
    admin: ["/admin", "/dashboard"], // Admin can access everything
    primary_secretary: ["/dashboard/primary"],
    secondary_secretary: ["/dashboard/secondary"],
    doctor: ["/dashboard/doctor"],
    nurse: ["/dashboard/nurse"],
};

// Public routes that don't require authentication
const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/"];

function getTokenFromRequest(request: NextRequest): string | null {
    const cookieToken = request.cookies.get("accessToken")?.value;
    if (cookieToken) return cookieToken;

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    return null;
}

function parseJwt(token: string): { role?: string; exp?: number; sub?: string } | null {
    try {
        const base64Payload = token.split(".")[1];
        const payload = Buffer.from(base64Payload, "base64").toString("utf-8");
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

function isTokenExpired(payload: { exp?: number }): boolean {
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
}

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const token = getTokenFromRequest(request);
    const isPublicPath = publicPaths.some(
        (path) => pathname === path || (path !== "/" && pathname.startsWith(path))
    );
    const isDashboardPath = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    // No token - redirect to login if trying to access protected route
    if (!token) {
        if (isDashboardPath) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Parse and validate token
    const payload = parseJwt(token);

    if (!payload || isTokenExpired(payload)) {
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
    }

    // Authenticated user trying to access auth pages - redirect to dashboard
    if (isPublicPath && pathname !== "/") {
        const userRole = payload.role as string;
        const dashboardPath = roleDashboardPaths[userRole] || "/dashboard/secondary";
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Role-based access control for protected routes
    if (isDashboardPath && payload.role) {
        const userRole = payload.role as string;
        const allowedPaths = roleAllowedPaths[userRole] || [];

        // Check if user has access to this path
        const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

        if (!hasAccess) {
            // Redirect to user's default dashboard
            const dashboardPath = roleDashboardPaths[userRole] || "/dashboard/secondary";
            return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
