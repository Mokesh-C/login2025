import { Suspense } from 'react'
import AlumniRegisterClient from '@/components/AlumniRegisterPage'

export default function AlumniRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-5rem)] flex items-center justify-center text-white">Loading…</div>}>
      <AlumniRegisterClient />
    </Suspense>
  )
}
