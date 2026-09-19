import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email().toLowerCase().trim() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Invalidate old tokens for this user
    await db.verificationToken.deleteMany({
      where: { userId: user.id, tokenType: "PASSWORD_RESET" },
    });

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        tokenType: "PASSWORD_RESET",
        expires,
      },
    });

    await sendPasswordResetEmail(email, rawToken + "." + user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ForgotPassword]", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}