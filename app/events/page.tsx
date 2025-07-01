import fs   from 'node:fs/promises'
import path from 'node:path'
import ClientEventsGrid       from './ClientEventsGrid'
import type { EventCardProps } from '@/components/EventCard'

async function getEvents() {
  const filePath = path.join(process.cwd(), 'data', 'events.json')
  const json     = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(json) as EventCardProps[]
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-100 to-primary">
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-satoshi">
            Our Events
          </h1>
          <p className="text-neutral-muted text-lg font-baloo">
            Discover amazing events and experiences
          </p>
        </div>

        {/* Animated grid lives in a Client component */}
        <ClientEventsGrid events={events} />
      </div>
    </div>
  )
}
