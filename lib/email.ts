import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "AI Image Suite <noreply@example.com>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  if (!resend) {
    // Dev fallback: log the link so developer can test
    console.log("[DEV] Password reset link:", resetUrl);
    return { success: true, dev: true };
  }

  const result = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your AI Image Suite password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#6366F1;margin-bottom:8px">Reset your password</h2>
        <p style="color:#475569;margin-bottom:24px">
          Click the button below to reset your password. This link expires in <strong>1 hour</strong> and can only be used once.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0"/>
        <p style="color:#94A3B8;font-size:11px">AI Image Suite · CS Capstone Project</p>
      </div>
    `,
  });

  return { success: !result.error, error: result.error };
}

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/auth/verify-email?token=${token}`;

  if (!resend) {
    console.log("[DEV] Email verification link:", verifyUrl);
    return { success: true, dev: true };
  }

  const result = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your AI Image Suite email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#6366F1;margin-bottom:8px">Verify your email</h2>
        <p style="color:#475569;margin-bottom:24px">Click below to verify your email address.</p>
        <a href="${verifyUrl}"
          style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">This link expires in 24 hours.</p>
      </div>
    `,
  });

  return { success: !result.error };
}