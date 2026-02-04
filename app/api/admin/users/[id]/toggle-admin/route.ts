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
    
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot modify your own status' }, { status: 400 })
    }

    const body = await request.json()
    const { isAdmin } = body

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

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
