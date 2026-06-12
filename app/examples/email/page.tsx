/**
 * Email examples page
 * Demonstrates how to use the email system
 */

import { sendEmail } from '@/lib/email';
import { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '@/lib/email/utils';

export default function EmailExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Email System Examples</h1>
      
      <div className="space-y-8">
        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <p className="text-gray-600 mb-4">
            Send emails using templates or custom content.
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`// Using a template
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: {
    name: 'John Doe',
    email: 'user@example.com',
    appName: 'MyApp',
    appUrl: 'https://myapp.com'
  }
});

// Custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<p>Hello!</p>',
  text: 'Hello!'
});`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Helper Functions</h2>
          <p className="text-gray-600 mb-4">
            Use pre-built helpers for common email operations.
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`import { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '@/lib/email/utils';

// Welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');

// Email verification
await sendVerificationEmail(
  'user@example.com',
  'https://myapp.com/verify?token=abc123',
  'John Doe'
);

// Password reset
await sendPasswordResetEmail(
  'user@example.com',
  'https://myapp.com/reset?token=abc123',
  'John Doe'
);`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">In Server Actions</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`'use server';

import { sendWelcomeEmail } from '@/lib/email/utils';

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  
  // Create user in database
  const user = await prisma.user.create({
    data: { email, name }
  });
  
  // Send welcome email
  await sendWelcomeEmail(email, name);
  
  return { success: true };
}`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">In API Routes</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email, name } = await request.json();
  
  const result = await sendEmail({
    to: email,
    template: 'welcome',
    data: { email, name, appName: 'MyApp', appUrl: 'https://myapp.com' }
  });
  
  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
}`}</code>
          </pre>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Templates</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><code className="bg-gray-100 px-2 py-1 rounded">welcome</code> - Welcome new users</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">verify-email</code> - Email verification</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">password-reset</code> - Password reset</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Add custom templates in <code>lib/email/templates/</code>
          </p>
        </section>

        <section className="border rounded-lg p-6 bg-blue-50">
          <h2 className="text-2xl font-semibold mb-4">Testing</h2>
          <p className="text-gray-700 mb-4">
            Test your email configuration using the test endpoint:
          </p>
          <pre className="bg-white p-4 rounded overflow-x-auto border">
            <code>{`curl -X POST http://localhost:3000/api/email/test \\
  -H "Content-Type: application/json" \\
  -d '{"to": "your-email@example.com", "template": "welcome"}'`}</code>
          </pre>
          <p className="mt-4 text-sm text-red-600">
            ⚠️ Remove or protect the test endpoint in production!
          </p>
        </section>
      </div>
    </div>
  );
}
