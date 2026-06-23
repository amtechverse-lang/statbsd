import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/",
    "/modules",
    "/modules/:path*",
    "/practice",
    "/practice/:path*",
    "/progress",
    "/progress/:path*",
    "/exam-prep",
    "/exam-prep/:path*",
    "/tools",
    "/tools/:path*",
    "/api/progress",
    "/api/progress/:path*",
    "/api/questions",
    "/api/questions/:path*",
    "/api/exams",
    "/api/exams/:path*",
    "/api/modules",
    "/api/modules/:path*",
  ],
};
