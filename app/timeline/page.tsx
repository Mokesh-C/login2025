import ScheduleTimeline from "./ScheduleTimeline"

export default function SchedulePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-accent-first via-accent-second to-accent-third">
      <h1 className="text-4xl md:text-5xl font-bold text-center py-12 font-manrope text-foreground">
        Schedule of Events
      </h1>
      <ScheduleTimeline />
    </div>
  )
}
