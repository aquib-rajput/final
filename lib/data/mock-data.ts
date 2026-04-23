// Real data comes from the backend; these exports exist only to keep legacy
// consumers compiling while the full production data layer is wired up.
// Every array is intentionally empty so the UI renders proper empty states.

import type {
  Mosque,
  Event,
  FinanceRecord,
  Announcement,
  DonationGoal,
  PrayerTime,
  Imam,
  ManagementMember,
} from "../types"

export const mockMosques: Mosque[] = []
export const mockEvents: Event[] = []
export const mockFinanceRecords: FinanceRecord[] = []
export const mockDonationGoals: DonationGoal[] = []
export const mockAnnouncements: Announcement[] = []
export const mockImams: Imam[] = []
export const mockManagementMembers: ManagementMember[] = []
export const mockPrayerTimes: PrayerTime[] = []

export const mosques = mockMosques
export const events = mockEvents
export const announcements = mockAnnouncements
export const donations: FinanceRecord[] = []
export const expenses: FinanceRecord[] = []
export const donationGoals = mockDonationGoals
export const imams = mockImams
export const managementMembers = mockManagementMembers

export function getMosqueById(_id: string): Mosque | undefined {
  return undefined
}

export function getEventsByMosqueId(_mosqueId: string): Event[] {
  return []
}

export function getFinanceByMosqueId(_mosqueId: string): FinanceRecord[] {
  return []
}

export function getAnnouncementsByMosqueId(_mosqueId: string): Announcement[] {
  return []
}

export function getDonationGoalsByMosqueId(_mosqueId: string): DonationGoal[] {
  return []
}

export function getPrayerTimesByMosqueId(_mosqueId: string): PrayerTime | undefined {
  return undefined
}

export function getImamsByMosqueId(_mosqueId: string): Imam[] {
  return []
}

export function getImamById(_id: string): Imam | undefined {
  return undefined
}

export function getManagementByMosqueId(_mosqueId: string): ManagementMember[] {
  return []
}

export function getManagementMemberById(_id: string): ManagementMember | undefined {
  return undefined
}

// Haversine distance in kilometers — still useful as a pure utility.
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getNearbyMosques(
  _lat: number,
  _lon: number,
  _radiusKm: number = 50,
): Array<Mosque & { distance: number }> {
  return []
}
