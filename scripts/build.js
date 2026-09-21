const { execSync } = require("child_process");

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && !dbUrl.includes("user:password@host")) {
  console.log("⚡ DATABASE_URL detected — pushing Prisma schema to database...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("✅ Database schema synced successfully.");
  } catch (err) {
    console.error("❌ Failed to sync database schema:", err.message);
    process.exit(1);
  }
} else {
  console.log("ℹ️ Skipping 'prisma db push' (no valid DATABASE_URL configured yet).");
}

console.log("🚀 Building Next.js application...");
execSync("next build", { stdio: "inherit" });