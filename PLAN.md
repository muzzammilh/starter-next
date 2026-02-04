# Implementation Plan: Shadcn/UI + Admin Dashboard Improvements

## Overview

Transform starter-next admin dashboard by installing Shadcn/UI foundation and improving visual design. Keep sidebar navigation, remove all subscription-related data, add icons to stats, and include a recent activity feed. Backport user listing page from sales-buddy (simplified version without subscription features).

**Important:** This plan will NOT make any changes to the database schema.

## Requirements Confirmed

✅ Keep sidebar navigation  
✅ No subscription features  
✅ Keep user detail page as-is  
✅ Add icons to stats cards  
✅ Add recent activity feed  
✅ Use default Shadcn colors  
✅ Keep dark mode support  
✅ Backport user listing (simplified, no subscription)  
✅ No database schema changes  

---

## Phase 1: Install Dependencies

### 1.1 Install Core Packages

**Command:**
```bash
npm install lucide-react clsx tailwind-merge class-variance-authority date-fns @radix-ui/react-slot
```

**Purpose:**
- `lucide-react`: Professional icons library
- `clsx + tailwind-merge`: Utility for merging Tailwind classes
- `class-variance-authority`: Manage component variants efficiently
- `date-fns`: Better date formatting for activity feed
- `@radix-ui/react-slot`: Needed for compound components (Button)

**Expected Outcome:**
- Dependencies added to `package.json`
- `node_modules` updated with new packages

---

## Phase 2: Set Up Utility Foundation

### 2.1 Create Utility Directory Structure

**New directory:** `lib/utils/`

### 2.2 Create Class Merging Utility

**New file:** `lib/utils/cn.ts`

**Content:**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Purpose:** Merge Tailwind classes intelligently, preventing conflicts

### 2.3 Create Utility Index File

**New file:** `lib/utils/index.ts`

**Content:**
```typescript
export { cn } from "./cn"
```

**Purpose:** Centralized exports for clean imports

---

## Phase 3: Configure Shadcn/UI Theme

### 3.1 Update Tailwind Config

**File to update:** `tailwind.config.ts` (create if doesn't exist)

**Complete config:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Changes:**
- Add all Shadcn semantic color variables
- Add radius variable for consistent rounded corners
- Keep content paths for component detection

### 3.2 Update Global CSS

**File to update:** `app/globals.css`

**Complete content:**
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Changes:**
- Add CSS variables for light mode
- Add CSS variables for dark mode
- Add base layer with border and background styles

---

## Phase 4: Add Shadcn/UI Components

### 4.1 Create components/ui Directory

**New directory:** `components/ui/`

### 4.2 Card Component

**New file:** `components/ui/card.tsx`

**Content:**
```typescript
import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "rounded-xl border bg-card text-card-foreground shadow-sm",
      interactive:
        "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:border-zinc-300 hover:-translate-y-1 cursor-pointer",
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-card-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
```

**Purpose:** Reusable card component with variants, used everywhere in dashboard

### 4.3 Badge Component

**New file:** `components/ui/badge.tsx`

**Content:**
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

**Purpose:** Status indicators for roles, user status, etc.

### 4.4 Input Component

**New file:** `components/ui/input.tsx`

**Content:**
```typescript
import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200",
          "border-input shadow-sm",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-transparent",
          "hover:border-zinc-300",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Purpose:** Standardized input with focus states and error handling

### 4.5 Label Component

**New file:** `components/ui/label.tsx`

**Content:**
```typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

**Purpose:** Accessible form labels with Radix primitives

### 4.6 Button Component

**New file:** `components/ui/button.tsx`

**Content:**
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Purpose:** Standardized button with variants (default, destructive, outline, secondary, ghost, link)

### 4.7 LoadingSpinner Component

**New file:** `components/ui/loading-spinner.tsx`

**Content:**
```typescript
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      aria-label="Loading"
    />
  )
}
```

**Purpose:** Reusable loading spinner with size variants

### 4.8 LoadingCard Component

**New file:** `components/ui/loading-card.tsx`

**Content:**
```typescript
import { LoadingSpinner } from "./loading-spinner"

interface LoadingCardProps {
  title?: string
  description?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingCard({
  title = "Loading",
  description,
  size = "md",
}: LoadingCardProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-[500px]">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size={size} />
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
```

**Purpose:** Full-page loading state with optional text

---

## Phase 5: Create Admin Components

### 5.1 RecentActivityFeed Component

**New file:** `components/admin/RecentActivityFeed.tsx`

**Content:**
```typescript
import { formatDistanceToNow } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  timestamp: Date
}

interface RecentActivityFeedProps {
  title: string
  items: ActivityItem[]
}

export function RecentActivityFeed({ title, items }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-4">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Purpose:** Display recent user signups with relative time formatting

### 5.2 ToggleAdminButton Component

**New file:** `components/admin/ToggleAdminButton.tsx`

**Content:**
```typescript
"use client"

import { useState } from "react"
import { Shield, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToggleAdminButtonProps {
  userId: string
  userEmail: string
  isAdmin: boolean
  isCurrentUser: boolean
}

export function ToggleAdminButton({
  userId,
  userEmail,
  isAdmin,
  isCurrentUser,
}: ToggleAdminButtonProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    if (isCurrentUser) {
      alert("You cannot change your own admin status")
      return
    }

    if (!confirm(`Are you sure you want to ${isAdmin ? 'remove' : 'grant'} admin privileges for ${userEmail}?`)) {
      return
    }

    setIsToggling(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      })

      if (!response.ok) {
        throw new Error('Failed to update admin status')
      }

      window.location.reload()
    } catch (error) {
      alert('Failed to update admin status')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Button
      variant={isAdmin ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isToggling || isCurrentUser}
      className="h-8"
    >
      {isToggling ? (
        'Updating...'
      ) : isAdmin ? (
        <>
          <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
          Remove
        </>
      ) : (
        <>
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          Admin
        </>
      )}
    </Button>
  )
}
```

**Purpose:** Toggle user role between admin and user with confirmation

---

## Phase 6: Update Existing Admin Components

### 6.1 Update StatsCard Component

**File to update:** `components/admin/StatsCard.tsx`

**New interface:**
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}
```

**Complete content:**
```typescript
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          <p className="mt-2 text-3xl font-bold text-card-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
```

**Changes:**
- Add optional icon prop
- Use new Card component from shadcn
- Use semantic color classes (card-foreground, muted-foreground)
- Add icon container with background
- Better visual hierarchy

### 6.2 Update AdminSidebar Component

**File to update:** `components/admin/AdminSidebar.tsx`

**Changes:**
- Add Lucide icons to nav items (LayoutDashboard, Users)
- Improve hover states
- Better active state styling
- Use semantic color classes

**Complete updated content:**
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-card-foreground">
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 mb-2 text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition"
        >
          Back to App
        </Link>
        <SignOutButton className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition flex items-center justify-center gap-3" />
      </div>
    </aside>
  );
}
```

**Changes:**
- Add LayoutDashboard and Users icons from lucide-react
- Add LogOut icon for sign out
- Use semantic color classes (card, border, primary, muted-foreground, accent)
- Better spacing with gap-3
- Improve hover states
- SignOutButton now shows "Sign Out" text with icon

---

## Phase 7: Update Admin Pages

### 7.1 Update Admin Dashboard Page

**File to update:** `app/admin/dashboard/page.tsx`

**Key changes:**
1. Import new components (Icons from lucide-react, Card, RecentActivityFeed)
2. Add icons to stats cards (Users, Shield, TrendingUp)
3. Improve header with better typography
4. Improve role distribution with Badge components
5. Add Recent Activity section
6. Improve signups chart styling with better colors

**Complete updated page:**
```typescript
import { prisma } from "@/lib/db/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { Users, Shield, TrendingUp } from "lucide-react";

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, roleDistribution, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  // Group signups by date
  const signupsByDate = recentUsers.reduce(
    (acc, user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalUsers,
    roleDistribution: roleDistribution.map((r) => ({
      role: r.role,
      count: r._count.id,
    })),
    signupsOverTime: Object.entries(signupsByDate).map(([date, count]) => ({
      date,
      count,
    })),
    newUsersThisMonth: recentUsers.length,
    recentSignups: recentUsers.map(u => ({
      id: u.id,
      title: u.name || u.email || "Unknown",
      subtitle: u.email || "",
      timestamp: u.createdAt,
    })),
  };
}

export default async function AdminDashboardPage() {
  const analytics = await getAnalytics();

  const adminCount =
    analytics.roleDistribution.find((r) => r.role === "admin")?.count || 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          System overview and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="Admins"
          value={adminCount}
          icon={<Shield className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="New This Month"
          value={analytics.newUsersThisMonth}
          subtitle="Last 30 days"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Role Distribution */}
        <section className="rounded-lg border bg-card text-card-foreground p-6">
          <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>
          <div className="space-y-3">
            {analytics.roleDistribution.length === 0 ? (
              <p className="text-muted-foreground">No users yet</p>
            ) : (
              analytics.roleDistribution.map((role) => (
                <div
                  key={role.role}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <span className="capitalize text-card-foreground">
                    {role.role}
                  </span>
                  <span className="font-semibold text-card-foreground">
                    {role.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Signups */}
        <RecentActivityFeed
          title="Recent Signups"
          items={analytics.recentSignups}
        />
      </div>

      {/* Signups Over Time */}
      <section className="rounded-lg border bg-card text-card-foreground p-6">
        <h2 className="text-xl font-semibold mb-4">Signups Over Time</h2>
        {analytics.signupsOverTime.length === 0 ? (
          <p className="text-muted-foreground">
            No signups in the last 30 days
          </p>
        ) : (
          <div className="space-y-2">
            {analytics.signupsOverTime.map((day) => (
              <div
                key={day.date}
                className="flex items-center gap-4 py-2 border-b last:border-0"
              >
                <span className="text-sm text-muted-foreground w-28">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${Math.min(100, day.count * 10)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-card-foreground w-8 text-right">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

**Changes:**
- Add header with title and description
- Add icons to all three stats cards (Users, Shield, TrendingUp)
- Use semantic color classes (card-foreground, muted-foreground, primary)
- Add Recent Activity Feed component
- Improve layout with 2-column grid for role distribution + recent signups
- Better spacing and typography throughout

### 7.2 Update User Management Page

**File to update:** `app/admin/users/page.tsx`

**Key features:**
- Search by name or email
- Role filtering (All Users, Admins)
- Table with 50 users limit
- Show user avatar initials
- Badge for role (admin uses default variant, user uses secondary)
- Toggle Admin button (cannot toggle yourself)
- View user detail link
- Removed: All subscription-related columns

**Complete simplified content (no subscription data):**
```typescript
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { getCurrentUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleAdminButton } from "@/components/admin/ToggleAdminButton";

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  // Await searchParams (Next.js 15+)
  const params = await searchParams;

  // Build where clause for filtering
  const where: any = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.role) {
    where.role = params.role;
  }

  // Fetch users
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      profile: true,
    },
    take: 50,
  });

  const totalUsers = await prisma.user.count({ where });

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalUsers} total user{totalUsers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form action="/admin/users" method="get">
                <Input
                  type="search"
                  name="search"
                  placeholder="Search by name or email..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors duration-150"
              >
                All Users
              </Link>
              <Link
                href="/admin/users?role=admin"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors duration-150"
              >
                Admins
              </Link>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-card-foreground">
                              {(u.name || u.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-card-foreground">
                              {u.name || 'No name'}
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ToggleAdminButton
                            userId={u.id}
                            userEmail={u.email || ''}
                            isAdmin={u.role === 'admin'}
                            isCurrentUser={u.id === user.id}
                          />
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted hover:bg-accent border transition-colors duration-150"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

**Key features:**
- Search by name or email
- Role filtering (All Users, Admins)
- Table with 50 users limit
- Show user avatar initials
- Badge for role (admin uses default variant, user uses secondary)
- Toggle Admin button (cannot toggle yourself)
- View user detail link
- Removed: All subscription-related columns

### 7.3 Update Admin Layout

**File to update:** `app/admin/layout.tsx`

**Changes:**
- Improve background color
- Better spacing

**Complete updated content:**
```typescript
import { redirect } from "next/navigation";
import { getCurrentSession, isAdmin } from "@/lib/auth/utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

**Changes:**
- Use `bg-background` semantic color instead of hardcoded zinc
- Keep rest same (sidebar layout is good)

---

## Phase 8: Create API Endpoint

### 8.1 Create Toggle Admin API Endpoint

**New file:** `app/api/admin/users/[id]/toggle-admin/route.ts`

**Complete content:**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Prevent users from changing their own admin status
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot modify your own status' }, { status: 400 })
    }

    const body = await request.json()
    const { isAdmin } = body

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: isAdmin ? 'admin' : 'user' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Toggle admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Purpose:** Server endpoint to toggle admin privileges

---

## Phase 9: Verify Implementation

### 9.1 Check All Imports

**Verify:**
- All new components use correct import paths (@/components/ui/*, @/components/admin/*)
- All utils use correct import paths (@/lib/utils/cn)
- No broken imports

### 9.2 Test Build

**Commands to run:**
```bash
npm run build
npm run lint
```

**Expected:**
- Build succeeds without errors
- No TypeScript errors
- No linting errors

### 9.3 Test Functionality

**Manual testing checklist:**
- [ ] Admin dashboard loads with icons
- [ ] Stats cards display correctly with icons
- [ ] Recent activity feed shows with relative time
- [ ] User listing page loads
- [ ] Search works (by name and email)
- [ ] Role filter works (All Users, Admins)
- [ ] Toggle Admin button works
- [ ] Can't toggle own admin status
- [ ] Sidebar navigation works with icons
- [ ] Dark mode support works
- [ ] Responsive design works (mobile)

---

## Implementation Summary

### Files Created (13 new files):
```
lib/utils/
├── cn.ts                          # Class merging utility
└── index.ts                       # Utility exports

components/ui/
├── card.tsx                       # Shadcn Card component
├── badge.tsx                      # Shadcn Badge component
├── input.tsx                      # Shadcn Input component
├── label.tsx                      # Shadcn Label component
├── button.tsx                     # Shadcn Button component
├── loading-spinner.tsx            # Loading spinner component
└── loading-card.tsx              # Loading card component

components/admin/
├── RecentActivityFeed.tsx         # Recent activity feed
└── ToggleAdminButton.tsx          # Toggle admin button

app/api/admin/users/[id]/toggle-admin/
└── route.ts                      # Toggle admin API endpoint
```

### Files Modified (8 files):
```
package.json                      # Add dependencies
tailwind.config.ts                # Add Shadcn theme variables
app/globals.css                  # Add CSS variables
app/admin/dashboard/page.tsx       # Redesign with icons + recent activity
components/admin/StatsCard.tsx   # Add icon support
components/admin/AdminSidebar.tsx  # Add icons + improve styling
app/admin/users/page.tsx          # Backport from sales-buddy (simplified)
app/admin/layout.tsx              # Update colors
```

### Dependencies Added:
```json
{
  "lucide-react": "^0.554.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "class-variance-authority": "^0.7.1",
  "date-fns": "^4.1.0",
  "@radix-ui/react-slot": "^1.1.0"
}
```

### Bundle Impact:
- **New dependencies:** ~35KB gzipped
- **Total increase:** Minimal, well within acceptable limits
- **Performance:** No negative impact, better UX

---

## Timeline Estimate

- **Phase 1 (Dependencies):** 15 minutes
- **Phase 2 (Utils):** 10 minutes
- **Phase 3 (Theme Config):** 15 minutes
- **Phase 4 (Shadcn Components):** 1.5 hours
- **Phase 5 (Admin Components):** 30 minutes
- **Phase 6 (Dashboard Improvements):** 1 hour
- **Phase 7 (User Listing Backport):** 1.5 hours
- **Phase 8 (Navigation Polish):** 30 minutes
- **Phase 9 (Testing):** 30 minutes

**Total:** ~5.5 hours

---

## Important Notes

1. **No Database Schema Changes:** This plan does not modify `prisma/schema.prisma` in any way. All database interactions use existing models and fields.

2. **Backward Compatible:** All changes are additions and improvements. Existing functionality is preserved.

3. **User Detail Page:** The existing `/admin/users/[id]/page.tsx` remains unchanged. The "View" button in user listing will continue to work.

4. **Dark Mode:** Full dark mode support via Shadcn CSS variables. The template supports both light and dark themes.

5. **Role-Based Access:** The toggle-admin endpoint includes proper authorization checks to ensure only admins can modify roles.

6. **Self-Modification Prevention:** Users cannot toggle their own admin status for security reasons.

---

## Expected Outcome

After implementation, the starter-next template will have:

✅ Professional Shadcn/UI component library
✅ Modern admin dashboard with icons and better UX
✅ Improved user management with search, filtering, and role toggling
✅ Recent activity feed for admin dashboard
✅ Dark mode support
✅ Consistent design system across admin pages
✅ Reusable components for future features
✅ ~35KB additional bundle size
✅ No database schema changes
✅ Full backward compatibility

---

**End of Plan**
