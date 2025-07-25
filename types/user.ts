export interface User extends BaseUser {
    role: "admin" | "student" | "alumni" | "coordinator" | "volunteer" | "user",
    studentData?: StudentData,
    alumniData?: AlumniData,
    preferences?: UserPreferences,
}

type UserGender = "Male" | "Female" | "Others"

export interface BaseUser {
    id: number,
    name: string,
    avatarUrl?: string,
    gender?: UserGender,
    createdOn: string,
    mobile: string,
    email?: string,
    preferences?: UserPreferences,
}
export interface UserPreferences {
    foodPreference: "VEG" | "NON-VEG",
    updatedOn: string,
    accommodation: boolean,
}

export interface StudentData {
    college: string,
    programme: string,
    field: string,
    year: string,
    idCardUrl?: string,
    type: "student"
}

export interface AlumniData {
    rollNo: string,
    currentCompany: string,
    currentRole: string,
    updatedOn: string,
    type: "alumni"
}