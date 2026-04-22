// Real Shura council data is being wired through dedicated APIs + stores.
// Until that migration is complete these exports intentionally return empty
// datasets so the UI surfaces proper empty states instead of fake numbers.

import type {
  ShuraMember,
  MosqueVisit,
  ShuraMeeting,
  MosqueRegistration,
  MosqueAssessment,
  ImamAppointment,
} from "../types"

export const shuraMembers: ShuraMember[] = []
export const mosqueVisits: MosqueVisit[] = []
export const shuraMeetings: ShuraMeeting[] = []
export const mosqueRegistrations: MosqueRegistration[] = []
export const mosqueAssessments: MosqueAssessment[] = []
export const imamAppointments: ImamAppointment[] = []

export interface ShuraTeam {
  id: string
  name: string
  description: string
  lead: string
  region: string
  members: string[]
  tasksCompleted: number
  totalTasks: number
}
export const shuraTeams: ShuraTeam[] = []

export type EnhancedShuraMember = ShuraMember & {
  role: string
  image: string
  status: string
  mosquesAssigned: number
  visitsCompleted: number
  performanceScore: number
  assignedRegions: string[]
}
export const enhancedShuraMembers: EnhancedShuraMember[] = []

export interface ShuraMosqueSummary {
  id: string
  name: string
  address: string
  region: string
  capacity: number
  registrationStatus: "registered" | "pending" | "rejected"
  needsImam: boolean
  positionNeeded?: string
}
export const mosques: ShuraMosqueSummary[] = []

export interface ImamCandidate {
  id: string
  name: string
  specialization: string
  education: string
  experience: number
  rating: number
  languages: string[]
  status: "available" | "assigned"
  image: string
}
export const imamCandidates: ImamCandidate[] = []

export interface EnhancedImamAppointment {
  id: string
  candidateName: string
  candidateImage: string
  mosqueName: string
  position: string
  status: "pending" | "interview" | "approved" | "appointed" | "rejected"
  proposedDate: string
  notes: string
}
export const enhancedImamAppointments: EnhancedImamAppointment[] = []

export interface ShuraLecture {
  id: string
  title: string
  topic: string
  speaker: string
  speakerImage: string
  speakerRole: string
  type: string
  date: string
  time: string
  venue: string
  status: "upcoming" | "completed" | "cancelled"
  attendees: number
  hasRecording: boolean
  duration?: string
  views?: number
}
export const lectures: ShuraLecture[] = []

// Helper functions that now operate on empty datasets.
export function getShuraMemberById(_id: string): ShuraMember | undefined {
  return undefined
}

export function getVisitsByMosqueId(_mosqueId: string): MosqueVisit[] {
  return []
}

export function getVisitsByShuraMemberId(_shuraMemberId: string): MosqueVisit[] {
  return []
}

export function getAssessmentByMosqueId(_mosqueId: string): MosqueAssessment | undefined {
  return undefined
}

export function getPendingRegistrations(): MosqueRegistration[] {
  return []
}

export function getUpcomingMeetings(): ShuraMeeting[] {
  return []
}

export function getScheduledVisits(): MosqueVisit[] {
  return []
}
