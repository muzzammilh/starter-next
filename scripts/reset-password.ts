/**
 * Password Reset Utility
 * 
 * Usage: npx tsx scripts/reset-password.ts <email> <new-password>
 * Example: npx tsx scripts/reset-password.ts user@example.com NewPassword123
 */

import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth/password";

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: npx tsx scripts/reset-password.ts <email> <new-password>");
    console.error("Example: npx tsx scripts/reset-password.ts user@example.com NewPassword123");
    process.exit(1);
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log(`✅ Password reset successful for: ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log(`   You can now sign in with this password.`);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
