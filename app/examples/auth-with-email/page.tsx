/**
 * Example: Authentication with Email Integration
 * 
 * This example shows how to integrate the email system with authentication:
 * - Send welcome email on signup
 * - Send verification email
 * - Send password reset email
 */

export default function AuthWithEmailExample() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication with Email Integration</h1>
      
      <div className="space-y-8">
        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">1. Send Welcome Email on Signup</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email/utils';
import { hash } from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Hash password
    const passwordHash = await hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Store password hash in your schema if using credentials auth
      },
    });
    
    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Don't fail the signup if email fails
    });
    
    return NextResponse.json({ 
      success: true, 
      userId: user.id 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">2. Email Verification Flow</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`// app/api/auth/send-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email/utils';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email already verified',
      });
    }
    
    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    // Send verification email
    const verificationUrl = \`\${process.env.NEXT_PUBLIC_APP_URL}/verify?token=\${token}\`;
    await sendVerificationEmail(email, verificationUrl, user.name || undefined);
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

// app/api/auth/verify/route.ts
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }
    
    // Check if expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 400 }
      );
    }
    
    // Update user
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });
    
    // Delete token
    await prisma.verificationToken.delete({
      where: { token },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">3. Password Reset Flow</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email/utils';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      });
    }
    
    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: \`reset:\${email}\`,
        token,
        expires,
      },
    });
    
    // Send reset email
    const resetUrl = \`\${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=\${token}\`;
    await sendPasswordResetEmail(email, resetUrl, user.name || undefined);
    
    return NextResponse.json({ 
      success: true,
      message: 'If the email exists, a reset link has been sent' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// app/api/auth/reset-password/route.ts
import { hash } from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    // Find token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!resetToken || !resetToken.identifier.startsWith('reset:')) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }
    
    // Check if expired
    if (resetToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 400 }
      );
    }
    
    // Extract email
    const email = resetToken.identifier.replace('reset:', '');
    
    // Hash new password
    const passwordHash = await hash(password, 10);
    
    // Update user password (adjust based on your schema)
    // await prisma.user.update({
    //   where: { email },
    //   data: { passwordHash },
    // });
    
    // Delete token
    await prisma.verificationToken.delete({
      where: { token },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    );
  }
}`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6 bg-blue-50">
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Don't block user actions waiting for emails to send</li>
            <li>Use try-catch to handle email failures gracefully</li>
            <li>Log email operations for debugging</li>
            <li>Prevent email enumeration (always return success)</li>
            <li>Use secure tokens (crypto.randomBytes)</li>
            <li>Set appropriate expiration times</li>
            <li>Clean up expired tokens periodically</li>
            <li>Test email flows in development mode first</li>
          </ul>
        </section>

        <section className="border rounded-lg p-6 bg-yellow-50">
          <h2 className="text-2xl font-semibold mb-4">Security Notes</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Never expose whether an email exists in your system</li>
            <li>Use cryptographically secure tokens</li>
            <li>Set short expiration times for sensitive operations</li>
            <li>Rate limit email sending endpoints</li>
            <li>Validate email addresses before sending</li>
            <li>Use HTTPS for all verification/reset links</li>
            <li>Delete tokens after use</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
