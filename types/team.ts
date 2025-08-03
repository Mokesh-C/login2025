import { User } from "./user";

export interface Team {
    id: number;
    name: string;
    createdBy: number;
    createdOn: string;
    maxSize?: number;
}

export interface TeamMember {
    id: number;
    teamId: number;
    userId: number;
    invitationStatus: 'pending' | 'accepted' | 'declined';
    invitedOn: string;
    respondedOn?: string;
    user?: User;
}

export interface TeamInvitation {
    id: number;
    teamId: number;
    userId: number;
    status: 'pending' | 'accepted' | 'declined';
    invitedOn: string;
    respondedOn?: string;
    team?: Team;
}

export interface CreateTeamResponse {
    success: boolean;
    message?: string;
    teamId?: number;
    team?: Team;
}

export interface TeamMembersResponse {
    success: boolean;
    message?: string;
    members?: TeamMember[];
}

export interface UserTeamsResponse {
    success: boolean;
    message?: string;
    teams?: Team[];
}
