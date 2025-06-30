import { Suspense } from 'react'
import ParticipantRegister from '@/components/ParticipantRegister'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading…</div>}>
      <ParticipantRegister />
    </Suspense>
  )
}
