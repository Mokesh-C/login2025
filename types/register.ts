interface BaseRegistration {
    id: number,
    eventId: number,
    registeredOn: string,
}
interface ParticipantRegistration extends BaseRegistration {
    userId: number,
    teamId?: number,
}

interface TeamRegistration extends BaseRegistration {
    teamId: number,
    userId?: number,
}

export type Registration = ParticipantRegistration | TeamRegistration