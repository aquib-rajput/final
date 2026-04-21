import { NextResponse } from "next/server";

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

const defaultPrayerTimes: PrayerTime[] = [
  { name: "Fajr", time: "05:15 AM", arabicName: "الفجر" },
  { name: "Sunrise", time: "06:30 AM", arabicName: "الشروق" },
  { name: "Dhuhr", time: "12:30 PM", arabicName: "الظهر" },
  { name: "Asr", time: "03:45 PM", arabicName: "العصر" },
  { name: "Maghrib", time: "06:30 PM", arabicName: "المغرب" },
  { name: "Isha", time: "08:00 PM", arabicName: "العشاء" },
];

export const revalidate = 86400; // Cache for 1 day

export async function GET() {
  try {
    return NextResponse.json({
      prayerTimes: defaultPrayerTimes,
      location: "Default Location",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/public/prayer-times/default] Error:", error);
    return NextResponse.json(
      {
        prayerTimes: defaultPrayerTimes,
        location: "Default Location",
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
