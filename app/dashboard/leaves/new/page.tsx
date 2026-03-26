"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLeaveRequest } from "@/app/actions/leaves"
import { validateLeafDates, getPastDateWarning } from "@/lib/leave-validation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewLeavePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [pastDateWarning, setPastDateWarning] = useState<string | null>(null)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartDate(value)
    setValidationError(null)
    
    if (value && endDate) {
      const error = validateLeafDates(value, endDate)
      if (error) {
        setValidationError(error)
      }
    }

    if (value) {
      const warning = getPastDateWarning(value)
      setPastDateWarning(warning)
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndDate(value)
    setValidationError(null)
    
    if (startDate && value) {
      const error = validateLeafDates(startDate, value)
      if (error) {
        setValidationError(error)
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    setValidationError(null)
    
    // Validation finale avant envoi
    const formStartDate = formData.get("startDate") as string
    const formEndDate = formData.get("endDate") as string
    
    const error = validateLeafDates(formStartDate, formEndDate)
    if (error) {
      setValidationError(error)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createLeaveRequest(formData)

      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Succès",
          description: "Votre demande d'absence a été soumise avec succès",
        })
        router.push("/dashboard/leaves")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/leaves">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Retour aux demandes
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle demande d'absence</CardTitle>
            <CardDescription>Remplissez le formulaire pour demander une absence</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    required 
                    disabled={isSubmitting}
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    required 
                    disabled={isSubmitting}
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                </div>
              </div>

              {validationError && (
                <div className="text-sm text-destructive font-medium">{validationError}</div>
              )}

              {pastDateWarning && !validationError && (
                <div className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">{pastDateWarning}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="leaveType">Type d'absence</Label>
                <Select name="leaveType" required disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Journée complète</SelectItem>
                    <SelectItem value="partial">Partielle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4" id="timeFields">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Heure de début (optionnel)</Label>
                  <Input id="startTime" name="startTime" type="time" disabled={isSubmitting} />
                  <p className="text-xs text-muted-foreground">Pour les absences partielles (ex: 7h-12h)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Heure de fin (optionnel)</Label>
                  <Input id="endTime" name="endTime" type="time" disabled={isSubmitting} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Expliquez brièvement la raison de votre absence..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard/leaves" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
