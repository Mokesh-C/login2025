import { Suspense } from 'react'
import ParticipantRegister from '@/components/ParticipantRegister'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-5rem)] flex items-center justify-center text-white">Loading…</div>}>
      <ParticipantRegister />
    </Suspense>
  )
}
