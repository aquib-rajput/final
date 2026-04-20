"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateImamForm } from "./create-imam-form"
import { toast } from "sonner"

interface CreateImamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosques: Array<{ id: string; name: string }>
  profiles: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export function CreateImamDialog({
  open,
  onOpenChange,
  mosques,
  profiles,
  onSuccess,
}: CreateImamDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    try {
      // Prepare the data for API
      const data = {
        profile_id: formData.profile_id || null,
        mosque_id: formData.mosque_id || null,
        name: formData.name,
        title: formData.title || null,
        specializations: formData.specializations || null,
        education: formData.education || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      }

      const response = await fetch("/api/imams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create imam")
      }

      toast.success("Imam created successfully!")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Imam</DialogTitle>
          <DialogDescription>
            Manage imam profiles, biographies, contact details, and the primary mosque assignment shown across the app.
          </DialogDescription>
        </DialogHeader>
        
        <CreateImamForm
          mosques={mosques}
          profiles={profiles}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
