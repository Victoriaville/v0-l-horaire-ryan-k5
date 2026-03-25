"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { changeOwnPassword } from "@/app/actions/password"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function PasswordSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isForced, setIsForced] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  // Initialize on client side only
  useEffect(() => {
    const forced = searchParams.get("reason") === "admin_reset" || searchParams.get("reason") === "force_reset"
    setIsForced(forced)
    setIsMounted(true)

    if (!forced) return

    // Prevent back button
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href)
    }
    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    // Prevent page unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      return ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [searchParams])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères"
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule"
    }
    if (!/[a-z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une minuscule"
    }
    if (!/[0-9]/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre"
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!currentPassword) {
      setError("Veuillez entrer votre mot de passe actuel")
      return
    }

    if (!newPassword) {
      setError("Veuillez entrer un nouveau mot de passe")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword === currentPassword) {
      setError("Le nouveau mot de passe doit être différent de l'actuel")
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)
    const result = await changeOwnPassword(currentPassword, newPassword)
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Redirect after 2 seconds if not forced reset
      if (!isForced) {
        setTimeout(() => {
          router.push("/dashboard/settings")
        }, 2000)
      } else {
        // If forced reset, redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } else {
      toast.error(result.message)
      setError(result.message)
    }
  }

  // Don't render until mounted on client to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Changer le mot de passe</h1>
        {isForced ? (
          <p className="text-amber-600 font-semibold">
            Pour des raisons de sécurité, vous devez mettre à jour votre mot de passe avant de continuer.
          </p>
        ) : (
          <p className="text-muted-foreground">Modifiez votre mot de passe</p>
        )}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>Assurez-vous d'utiliser un mot de passe sécurisé et conforme aux critères</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isForced && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-900">
                  Vous ne pouvez pas quitter cette page tant que vous n'avez pas mis à jour votre mot de passe.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <p className="font-semibold">Le mot de passe doit contenir:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li className={newPassword.length >= 8 ? "text-green-600" : ""}>Au moins 8 caractères</li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>Au moins une majuscule (A-Z)</li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>Au moins une minuscule (a-z)</li>
                  <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>Au moins un chiffre (0-9)</li>
                  <li className={/[!@#$%^&*]/.test(newPassword) ? "text-green-600" : ""}>
                    Au moins un caractère spécial (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Changement en cours...
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>

            {!isForced && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Annuler
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
