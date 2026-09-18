import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { notificationService } from '@/lib/services/notification-service';

export async function GET() {
  try {
    const user = await requireAuth();
    const notifications = await notificationService.getForUser(user.id);
    return NextResponse.json({ notifications });
  } catch (error: any) {
    const status = error?.status || 401;
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional when marking all as read
      body = {};
    }

    const { id, all } = body;

    if (!id || all) {
      // Mark all read for this user
      await notificationService.markAllRead(user.id);
      return NextResponse.json({ success: true, all: true });
    }

    // Authorization: only the recipient can mark their own notification as read
    const userNotifications = await notificationService.getForUser(user.id);
    const owned = userNotifications.find((n) => n.id === id);
    if (!owned) {
      return NextResponse.json(
        { error: 'Notification not found.' },
        { status: 404 }
      );
    }

    await notificationService.markRead(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error?.status || 401;
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status });
  }
}
