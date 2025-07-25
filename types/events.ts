import { User } from "./user";


export interface EventImage {
    id: number;
    url: string;
}

export interface Event {
    id: number;
    name: string;
    type: string;
    description: string;
    teamSize: number;
    closed: boolean;
    maxRegistration: number | -1; // -1 for unlimited registrations
    rules: string;
    logoUrl: string;
    coordinatorSize: number;
    rounds: EventRound[];
    coordinators: EventCoordinator[];
    volunteers: string[];
    images: EventImage[];
    tagline: string;
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