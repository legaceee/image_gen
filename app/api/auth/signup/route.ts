import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password (cost factor 12 — security/performance balance)
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("[Signup]", err);
    const msg = err?.message || "";

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL environment variable is missing on Vercel. Please check that you selected 'Production' and clicked 'Redeploy'." },
        { status: 503 }
      );
    }
    if (process.env.DATABASE_URL.includes("user:password@host")) {
      return NextResponse.json(
        { error: "DATABASE_URL contains placeholder values. Please replace it with your real PostgreSQL connection string." },
        { status: 503 }
      );
    }
    if (err?.code === "P1001" || msg.includes("Can't reach database server")) {
      return NextResponse.json(
        { error: "Cannot reach database server (Prisma P1001). Check if your database is active, password is correct, and '?sslmode=require' is appended." },
        { status: 503 }
      );
    }
    if (err?.code === "P2021" || msg.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database connected, but tables do not exist yet! Run 'npx prisma db push' in your project directory with your DATABASE_URL." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: `Database error (${err?.code || "unknown"}): ${err?.message || "Registration failed"}` }, { status: 500 });
  }
}