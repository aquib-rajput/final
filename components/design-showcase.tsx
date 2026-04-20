'use client'

import { useState } from 'react'
import { Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function DesignShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    specializations: '',
    education: '',
    yearsOfExperience: '',
  })

  return (
    <div className="space-y-8 py-8">
      {/* Quick Prayer View Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Prayer View - Premium Redesign</h2>
        <Card className="rounded-2xl border-border/40 shadow-elevation-md overflow-hidden">
          <div className="relative">
            {/* Premium gradient header with decorative accent */}
            <div className="bg-gradient-to-r from-primary/8 via-transparent to-accent/5 border-b border-border/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground tracking-tight">Prayer Times</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Today • April 19, 2026</p>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2.5">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                  <div
                    key={prayer}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-gradient-to-r from-primary/3 via-transparent to-accent/2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  >
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {prayer}
                    </span>
                    <span className="font-semibold tracking-wide text-primary">4:30 AM</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Create Imam Dialog Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Modal Dialog - Premium Design</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Open Dialog Example
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Imam</DialogTitle>
              <DialogDescription>
                Manage imam profiles, biographies, contact details, and the primary mosque assignment shown across the app.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Linked Profile Section */}
              <div className="space-y-2">
                <Label className="label-premium">Linked Profile</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Link an existing profile or create new one</p>
              </div>

              {/* Primary Mosque Section */}
              <div className="space-y-2">
                <Label className="label-premium">Primary Mosque</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optional">Choose mosque</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional. Choose the main mosque appointment for this imam.
                </p>
              </div>

              <Separator className="bg-border/20" />

              {/* Name Field */}
              <div className="space-y-2">
                <Label className="label-premium">Name</Label>
                <Input
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <Label className="label-premium">Title</Label>
                <Input
                  placeholder="e.g., Senior Imam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Specializations Field */}
              <div className="space-y-2">
                <Label className="label-premium">Specializations</Label>
                <Textarea
                  placeholder="e.g., Quran recitation, Islamic jurisprudence..."
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                />
              </div>

              {/* Education Field */}
              <div className="space-y-2">
                <Label className="label-premium">Education</Label>
                <Textarea
                  placeholder="Educational background and credentials..."
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label className="label-premium">Experience Years</Label>
                <Input
                  type="number"
                  placeholder="Number of years"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Create Imam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* Form Elements Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Premium Form Elements</h2>
        <Card className="rounded-2xl border-border/40 shadow-elevation-md">
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Example */}
            <div className="space-y-2">
              <Label className="label-premium">Text Input</Label>
              <Input placeholder="Enter text here..." />
            </div>

            {/* Select Example */}
            <div className="space-y-2">
              <Label className="label-premium">Select Dropdown</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option-1">Option 1</SelectItem>
                  <SelectItem value="option-2">Option 2</SelectItem>
                  <SelectItem value="option-3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Textarea Example */}
            <div className="space-y-2">
              <Label className="label-premium">Text Area</Label>
              <Textarea placeholder="Enter longer text here..." />
            </div>

            {/* Button Examples */}
            <div className="space-y-3">
              <Label className="label-premium">Button Variants</Label>
              <div className="flex flex-wrap gap-3">
                <Button>Default Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Design System Info */}
      <section className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/3 border border-border/30">
        <h3 className="text-lg font-semibold tracking-tight">✨ Premium Design System</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Refined glass-morphism with backdrop blur</li>
          <li>✓ Premium elevation shadow system</li>
          <li>✓ Smooth 300ms ease-out transitions</li>
          <li>✓ Cohesive color palette (green + gold accents)</li>
          <li>✓ Enhanced typography and spacing</li>
          <li>✓ Improved form elements with refined focus states</li>
          <li>✓ Interactive hover and active states</li>
          <li>✓ Consistent across all components</li>
        </ul>
      </section>
    </div>
  )
}
