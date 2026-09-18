import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function DocumentsIndexPage() {
  const user = await getCurrentUser();
  if (user?.role === 'AUDITOR' || user?.role === 'ADMIN') {
    redirect('/auditor/dashboard');
  } else {
    redirect('/client/dashboard');
  }
}
