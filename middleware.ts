import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/generate/:path*",
    "/history/:path*",
    "/api/generate/:path*",
    "/api/history/:path*",
  ],
};