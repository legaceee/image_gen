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
    if (msg.includes("Can't reach database server") || err?.code === "P1001" || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("user:password@host")) {
      return NextResponse.json(
        { error: "Database not connected yet. Please provide a valid PostgreSQL DATABASE_URL in .env.local / Vercel." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Registration failed: " + (err?.message || "Internal error") }, { status: 500 });
  }
}