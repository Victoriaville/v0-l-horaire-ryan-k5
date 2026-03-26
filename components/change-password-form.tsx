"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { changeOwnPassword } from "@/app/actions/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function ChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isForced = searchParams.get("reason") === "admin_reset" || searchParams.get("reason") === "force_reset"

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // If forced reset, disable browser back button
  if (isForced) {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.href)
      window.addEventListener("popstate", (event) => {
        window.history.pushState(null, "", window.location.href)
      })
    }
  }

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
    setSuccess("")

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

    try {
      setIsLoading(true)
      const result = await changeOwnPassword(currentPassword, newPassword)

      if (result.success) {
        setSuccess(result.message)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        // Redirect after 2 seconds if not forced reset, otherwise stay on page
        if (!isForced) {
          setTimeout(() => {
            router.push("/dashboard/settings")
          }, 2000)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Une erreur est survenue lors du changement de mot de passe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          {isForced ? (
            <CardDescription className="text-amber-600 font-semibold">
              Pour des raisons de sécurité, vous devez mettre à jour votre mot de passe avant de continuer.
            </CardDescription>
          ) : (
            <CardDescription>Mettez à jour votre mot de passe de compte</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Mot de passe actuel
              </label>
              <Input
                id="current-password"
                type="password"
                placeholder="Entrez votre mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                Nouveau mot de passe
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <p>Le mot de passe doit contenir:</p>
                <ul className="list-disc list-inside">
                  <li>Au moins 8 caractères</li>
                  <li>Au moins une majuscule (A-Z)</li>
                  <li>Au moins une minuscule (a-z)</li>
                  <li>Au moins un chiffre (0-9)</li>
                  <li>Au moins un caractère spécial (!@#$%^&*)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
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

            {isForced && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-900">
                  Vous ne pouvez pas quitter cette page tant que vous n'avez pas mis à jour votre mot de passe.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
