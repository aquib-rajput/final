"use client"

import { useState, useEffect } from 'react'
import { 
  Clock, 
  MapPin, 
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { mockMosques } from '@/lib/data'

interface PrayerTime {
  name: string
  arabicName: string
  time: string
  icon: React.ElementType
}

const calculationMethods = [
  { value: '2', label: 'Islamic Society of North America (ISNA)' },
  { value: '1', label: 'Muslim World League' },
  { value: '3', label: 'Egyptian General Authority' },
  { value: '4', label: 'Umm Al-Qura University, Makkah' },
  { value: '5', label: 'University of Islamic Sciences, Karachi' },
]

export function PrayerTimesView() {
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null)
  const [method, setMethod] = useState('2')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [hijriDate, setHijriDate] = useState('')

  // Initialize on mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setSelectedDate(new Date())
    setCurrentTime(new Date())
  }, [])

  // Update current time every second
  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const fetchPrayerTimes = async (lat: number, lng: number, date: Date | null) => {
    if (!date) return
    setLoading(true)
    try {
      const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
      )
      const data = await response.json()
      
      if (data.code === 200) {
        const timings = data.data.timings
        setPrayerTimes([
          { name: 'Fajr', arabicName: 'الفجر', time: timings.Fajr, icon: Sunrise },
          { name: 'Sunrise', arabicName: 'الشروق', time: timings.Sunrise, icon: Sun },
          { name: 'Dhuhr', arabicName: 'الظهر', time: timings.Dhuhr, icon: Sun },
          { name: 'Asr', arabicName: 'العصر', time: timings.Asr, icon: Sun },
          { name: 'Maghrib', arabicName: 'المغرب', time: timings.Maghrib, icon: Sunset },
          { name: 'Isha', arabicName: 'العشاء', time: timings.Isha, icon: Moon },
        ])
        
        const hijri = data.data.date.hijri
        setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} AH`)
      }
    } catch (error) {
      console.error('Failed to fetch prayer times:', error)
      // Use fallback times
      setPrayerTimes([
        { name: 'Fajr', arabicName: 'الفجر', time: '05:15', icon: Sunrise },
        { name: 'Sunrise', arabicName: 'الشروق', time: '06:30', icon: Sun },
        { name: 'Dhuhr', arabicName: 'الظهر', time: '12:30', icon: Sun },
        { name: 'Asr', arabicName: 'العصر', time: '15:45', icon: Sun },
        { name: 'Maghrib', arabicName: 'المغرب', time: '18:30', icon: Sunset },
        { name: 'Isha', arabicName: 'العشاء', time: '20:00', icon: Moon },
      ])
    }
    setLoading(false)
  }

  const requestLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: 'Your Location',
        }
        
        // Try to get city name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
          )
          const data = await response.json()
          coords.city = data.city || data.locality || 'Your Location'
        } catch {
          // Keep default
        }
        
        setLocation(coords)
        fetchPrayerTimes(coords.lat, coords.lng, selectedDate)
      },
      () => {
        // Use default location (New York)
        const defaultLocation = { lat: 40.7128, lng: -74.0060, city: 'New York, NY' }
        setLocation(defaultLocation)
        fetchPrayerTimes(defaultLocation.lat, defaultLocation.lng, selectedDate)
      }
    )
  }

  useEffect(() => {
    if (mounted) {
      requestLocation()
    }
  }, [mounted])

  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location.lat, location.lng, selectedDate)
    }
  }, [selectedDate, method])

  const changeDate = (days: number) => {
    if (!selectedDate) return
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const getCurrentPrayer = (): string | null => {
    if (prayerTimes.length === 0 || !currentTime) return null
    
    const now = currentTime.getHours() * 60 + currentTime.getMinutes()
    
    for (let i = prayerTimes.length - 1; i >= 0; i--) {
      const [hours, mins] = prayerTimes[i].time.split(':').map(Number)
      const prayerMinutes = hours * 60 + mins
      
      if (now >= prayerMinutes) {
        return prayerTimes[i].name
      }
    }
    
    return prayerTimes[prayerTimes.length - 1].name
  }

  const getNextPrayer = (): { name: string; time: string; remaining: string } | null => {
    if (prayerTimes.length === 0 || !currentTime) return null
    
    const now = currentTime.getHours() * 60 + currentTime.getMinutes()
    
    for (const prayer of prayerTimes) {
      if (prayer.name === 'Sunrise') continue
      
      const [hours, mins] = prayer.time.split(':').map(Number)
      const prayerMinutes = hours * 60 + mins
      
      if (now < prayerMinutes) {
        const diff = prayerMinutes - now
        const h = Math.floor(diff / 60)
        const m = diff % 60
        const remaining = h > 0 ? `${h}h ${m}m` : `${m}m`
        return { name: prayer.name, time: prayer.time, remaining }
      }
    }
    
    // Next day Fajr
    const fajr = prayerTimes[0]
    return { name: fajr.name, time: fajr.time, remaining: 'Tomorrow' }
  }

  const currentPrayer = getCurrentPrayer()
  const nextPrayer = getNextPrayer()

  return (
    <div className="space-y-8">
      {/* Prayer Times - Premium Card */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/5 to-accent/3 border-b border-border/40 p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Today&apos;s Prayer Times</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{hijriDate}</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-7 space-y-4">
          {prayerTimes.filter(p => p.name !== 'Sunrise').map((prayer, index) => (
            <div key={prayer.name} className={cn(
              "flex items-center justify-between py-4 transition-colors",
              index < prayerTimes.filter(p => p.name !== 'Sunrise').length - 1 ? "border-b border-border/30" : ""
            )}>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <div>
                  <p className="font-bold text-foreground text-base">{prayer.name}</p>
                  <p className="text-xs text-muted-foreground font-amiri italic">{prayer.arabicName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {prayer.time}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Iqama: {prayer.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settings - Premium */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => changeDate(-1)}
              className="h-10 w-10 p-0 rounded-lg hover:bg-accent/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-4 py-2 rounded-lg bg-muted/40 border border-border/40">
              <p className="text-sm font-bold text-foreground min-w-[160px] text-center">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                }) : 'Loading...'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => changeDate(1)}
              className="h-10 w-10 p-0 rounded-lg hover:bg-accent/50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {selectedDate && selectedDate.toDateString() !== new Date().toDateString() && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="text-xs font-semibold ml-2"
              >
                Go to Today
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-semibold text-muted-foreground">Method:</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full sm:w-[240px] h-10 text-sm font-medium rounded-lg border-border/60">
                <SelectValue placeholder="Calculation Method" />
              </SelectTrigger>
              <SelectContent>
                {calculationMethods.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-sm font-medium">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

