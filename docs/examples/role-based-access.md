# Role-Based Access Control Examples

This document provides practical examples of implementing role-based access control in your application.

## Available Roles

- **`user`** - Default role for all new signups
- **`admin`** - Full system access
- **`manager`** - Middle-tier access for content/user management
- **`guest`** - Restricted access for trial or read-only users

## Server Components

### Require Admin Access

```tsx
import { requireAdmin } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  try {
    await requireAdmin();
  } catch {
    redirect("/signin");
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin-only content */}
    </div>
  );
}
```

### Conditional Rendering Based on Role

```tsx
import { getCurrentUserRole, isAdmin, isAdminOrManager } from "@/lib/auth/utils";

export default async function Dashboard() {
  const role = await getCurrentUserRole();
  const isAdminUser = await isAdmin();
  const canManage = await isAdminOrManager();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your role: {role}</p>
      
      {isAdminUser && (
        <section>
          <h2>Admin Panel</h2>
          {/* Admin-only features */}
        </section>
      )}
      
      {canManage && (
        <section>
          <h2>Management Tools</h2>
          {/* Manager and Admin features */}
        </section>
      )}
      
      <section>
        <h2>User Content</h2>
        {/* Available to all authenticated users */}
      </section>
    </div>
  );
}
```

### Check Specific Role

```tsx
import { hasRole } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function ManagerPage() {
  const isManager = await hasRole("manager");
  
  if (!isManager) {
    redirect("/dashboard");
  }
  
  return <div>Manager-only content</div>;
}
```

## API Routes

### Require Admin for Deletion

```tsx
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api/middleware/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only admins can delete
  const authError = await requireRole(request, "admin");
  if (authError) return authError;
  
  // Delete logic here
  return NextResponse.json({ success: true });
}
```

### Different Access Levels

```tsx
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthUser } from "@/lib/api/middleware/auth";

export async function POST(request: NextRequest) {
  // Require authentication
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  const user = await getAuthUser(request);
  const userRole = (user as any)?.role || "user";
  
  // Different logic based on role
  if (userRole === "admin") {
    // Admins can do anything
    return NextResponse.json({ message: "Admin access granted" });
  } else if (userRole === "manager") {
    // Managers have limited access
    return NextResponse.json({ message: "Manager access granted" });
  } else if (userRole === "guest") {
    // Guests have read-only access
    return NextResponse.json(
      { error: "Guests cannot perform this action" },
      { status: 403 }
    );
  }
  
  // Regular users
  return NextResponse.json({ message: "User access granted" });
}
```

## Server Actions

### Role-Protected Server Action

```tsx
"use server";

import { requireRole } from "@/lib/auth/utils";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  // Only admins can delete users
  try {
    await requireRole("admin");
  } catch {
    return { error: "Unauthorized" };
  }
  
  // Delete user logic
  // await prisma.user.delete({ where: { id: userId } });
  
  revalidatePath("/admin/users");
  return { success: true };
}
```

### Manager or Admin Action

```tsx
"use server";

import { isAdminOrManager } from "@/lib/auth/utils";

export async function moderateContent(contentId: string) {
  const canModerate = await isAdminOrManager();
  
  if (!canModerate) {
    return { error: "Insufficient permissions" };
  }
  
  // Moderation logic
  return { success: true };
}
```

## Client Components

### Display Role in UI

```tsx
"use client";

import { useSession } from "next-auth/react";

export function UserRoleBadge() {
  const { data: session } = useSession();
  const role = session?.user?.role || "user";
  
  const roleColors = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
    guest: "bg-yellow-100 text-yellow-800",
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${roleColors[role]}`}>
      {role.toUpperCase()}
    </span>
  );
}
```

### Conditional Rendering

```tsx
"use client";

import { useSession } from "next-auth/react";

export function AdminButton() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  
  if (!isAdmin) return null;
  
  return (
    <button onClick={() => console.log("Admin action")}>
      Admin Action
    </button>
  );
}
```

## Promoting Users to Admin

To change a user's role:

1. Run Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to the `User` table

3. Find the user you want to promote

4. Change the `role` field from `user` to `admin` (or `manager`, `guest`)

5. Save the changes

6. The user will have the new role on their next login

## Best Practices

1. **Default to least privilege** - New users start as `user` role
2. **Use type-safe checks** - Import utilities from `@/lib/auth/utils`
3. **Protect both UI and API** - Check roles on server-side and client-side
4. **Log authorization failures** - The middleware automatically logs failed attempts
5. **Document role requirements** - Comment which roles can access each feature
6. **Test with different roles** - Create test accounts for each role

## Custom Roles

To add more roles (e.g., `editor`, `support`):

1. Update the `UserRole` enum in `prisma/schema.prisma`
2. Run `npm run db:push` to update the database
3. Update the type in `lib/auth/types.ts`
4. Add helper functions in `lib/auth/utils.ts` if needed
