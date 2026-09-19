import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(10),
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

    // Token format: rawToken.userId
    const [rawToken, userId] = parsed.data.token.split(".");
    if (!rawToken || !userId) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Find unused, non-expired token for this user
    const record = await db.verificationToken.findFirst({
      where: {
        userId,
        tokenType: "PASSWORD_RESET",
        usedAt: null,
        expires: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Reset link has expired or already been used" }, { status: 400 });
    }

    const valid = await bcrypt.compare(rawToken, record.token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(parsed.data.password, 12);

    // Atomically mark token as used and update password
    await db.$transaction([
      db.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      }),
      // Invalidate all active sessions for security
      db.session.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ResetPassword]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}