"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { acknowledgeAllNotificationErrors } from "@/app/actions/get-notification-history"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AcknowledgeAllErrorsButtonProps {
  errorCount: number
}

export function AcknowledgeAllErrorsButton({ errorCount }: AcknowledgeAllErrorsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const result = await acknowledgeAllNotificationErrors()
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (errorCount === 0) {
    return null
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <CheckCircle2 className="h-4 w-4" />
      Marquer tous les {errorCount} erreurs comme traitées
    </Button>
  )
}
