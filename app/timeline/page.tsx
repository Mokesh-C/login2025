import ScheduleTimeline from "./ScheduleTimeline"

export default function SchedulePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-primary via-primary-100 to-primary py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 font-satoshi text-foreground">
        Schedule of Events
      </h1>
      <ScheduleTimeline />
    </div>
  )
}
