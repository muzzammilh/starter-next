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
    } catch {
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
