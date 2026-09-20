import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { AdminSidebar } from '@/components/AdminSidebar'

export const metadata = {
  title: 'Админка',
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = cookies().get('auth_token')?.value
  if (!token) redirect('/login?redirect=/admin')

  try {
    const payload = await verifyToken(token)
    if (payload.role !== 'ADMIN') redirect('/')
  } catch {
    redirect('/login?redirect=/admin')
  }

  return (
    <div className="shell py-10">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <aside className="col-span-12 lg:col-span-3">
          <AdminSidebar />
        </aside>
        <div className="col-span-12 lg:col-span-9">{children}</div>
      </div>
    </div>
  )
}