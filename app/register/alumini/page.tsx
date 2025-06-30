import { Suspense } from 'react'
import AlumniRegisterClient from '@/components/AlumniRegisterPage'

export default function AlumniRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading…</div>}>
      <AlumniRegisterClient />
    </Suspense>
  )
}
