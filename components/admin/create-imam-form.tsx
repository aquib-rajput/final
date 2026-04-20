"use client"

import { useState } from "react"
import { Loader2, User, BookOpen, Briefcase, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CreateImamFormProps {
  mosques: Array<{ id: string; name: string }>
  profiles: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function CreateImamForm({
  mosques,
  profiles,
  onSubmit,
  isLoading = false,
}: CreateImamFormProps) {
  const [formData, setFormData] = useState({
    profile_id: "",
    mosque_id: "",
    name: "",
    title: "",
    specializations: "",
    education: "",
    experience_years: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile & Primary Mosque Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary shadow-inner">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Profile Link</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">Connect to existing profile</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Linked Profile
              </Label>
              <Select value={formData.profile_id} onValueChange={(value) => handleChange("profile_id", value)}>
                <SelectTrigger id="profile_id" className="h-11 sm:h-10 bg-muted/20 border-border/40">
                  <SelectValue placeholder="Select a profile (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None - Create new</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Link an existing user profile or leave empty to create new</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary shadow-inner">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Primary Mosque</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">Main assignment location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mosque_id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Mosque Assignment
              </Label>
              <Select value={formData.mosque_id} onValueChange={(value) => handleChange("mosque_id", value)}>
                <SelectTrigger id="mosque_id" className="h-11 sm:h-10 bg-muted/20 border-border/40">
                  <SelectValue placeholder="Select mosque (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None assigned</SelectItem>
                  {mosques.map((mosque) => (
                    <SelectItem key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose the main mosque assignment for this imam</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information Section */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shadow-inner">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Personal Details</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">Name, title, and professional information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Abdullah Mohammed"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-11 sm:h-10 text-base sm:text-sm bg-muted/20 border-border/40 focus:bg-background transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Lead Imam"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="h-11 sm:h-10 text-base sm:text-sm bg-muted/20 border-border/40 focus:bg-background transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise Section */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shadow-inner">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Expertise & Background</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">Specializations, education, and experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specializations" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Specializations
            </Label>
            <Textarea
              id="specializations"
              placeholder="e.g. Quranic recitation, Islamic jurisprudence, community outreach"
              value={formData.specializations}
              onChange={(e) => handleChange("specializations", e.target.value)}
              className="min-h-20 text-base sm:text-sm bg-muted/20 border-border/40 focus:bg-background transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Education
            </Label>
            <Textarea
              id="education"
              placeholder="e.g. Al-Azhar University - Islamic Studies, Diploma in Islamic Law"
              value={formData.education}
              onChange={(e) => handleChange("education", e.target.value)}
              className="min-h-20 text-base sm:text-sm bg-muted/20 border-border/40 focus:bg-background transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Years of Experience
            </Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              placeholder="e.g. 15"
              value={formData.experience_years}
              onChange={(e) => handleChange("experience_years", e.target.value)}
              className="h-11 sm:h-10 text-base sm:text-sm bg-muted/20 border-border/40 focus:bg-background transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-border/30">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.name}
          className="flex-1 gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Imam
        </Button>
      </div>
    </form>
  )
}
