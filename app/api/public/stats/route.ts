import { NextResponse } from "next/server";
import { getPublicDirectoryMosques, getPublishedEvents } from "@/lib/mosques/public";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const [mosques, events] = await Promise.all([
      getPublicDirectoryMosques(true, -1),
      getPublishedEvents(-1),
    ]);

    // Count unique countries from mosques
    const countriesSet = new Set<string>();
    mosques.forEach((mosque) => {
      if (mosque.country) {
        countriesSet.add(mosque.country);
      }
    });

    const stats = {
      totalMosques: mosques.length,
      totalEvents: events.length,
      countriesCovered: countriesSet.size,
      totalMembers: 0, // This would require querying profiles table if available
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[api/public/stats] Error:", error);
    return NextResponse.json(
      {
        totalMosques: 0,
        totalEvents: 0,
        countriesCovered: 0,
        totalMembers: 0,
      },
      { status: 200 }
    );
  }
}
