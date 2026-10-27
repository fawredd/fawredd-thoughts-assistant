import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: [
        '/app(.*)',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/(api|trpc)(.*)',
    ],
};
