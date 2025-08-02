import { User } from "./user";


export interface EventImage {
    // Some images use 'id', some use 'eventId' in the data
    id?: number;
    eventId?: number;
    url: string;
}

export enum EventType {
    TECHNICAL = "Technical",
    NON_TECHNICAL = "Non Technical",
}

export interface Event {
    id: number;
    name: string;
<<<<<<< HEAD
    type: string;
    description: string;
=======
    type: EventType;
    description?: string;
>>>>>>> 321b0f0d9a5dda68faf8aa4b037fb4de2b065ba0
    teamMinSize: number;
    teamMaxSize: number;
    closed: boolean;
    maxRegistration?: number | -1; // -1 for unlimited registrations
    rules?: string;
    logoUrl?: string;
    coordinatorSize: number;
    rounds: EventRound[];
    coordinators: EventCoordinator[];
    volunteers: string[];
    images: EventImage[];
    tagline?: string;
}


export interface EventRound {
    id?: number;
    mode: string;
    name: string;
    description?: string;
    venue?: string;
    time?: string;
    duration?: number;
    rules?: string;
}

export interface EventCoordinator {
    userId: User['id'],
    name: User['name'],
    mobile: User['mobile'],
    email: User['email'],
    avatarUrl: User['avatarUrl']
}