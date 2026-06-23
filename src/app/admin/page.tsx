import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to login if not authenticated
  redirect('/admin/login');
}
