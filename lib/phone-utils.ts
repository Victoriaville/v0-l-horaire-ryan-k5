/**
 * Extrait SEULEMENT les chiffres d'un numéro de téléphone
 * @param phone - Le numéro de téléphone avec formatage
 * @returns Les chiffres uniquement
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Formate un numéro de téléphone en temps réel pendant la saisie
 * Convertit "5141234567" en "(514) 123-4567"
 * 
 * Accepte n'importe quel format en entrée, formate en sortie
 * @param phone - Le numéro brut ou partiellement saisi
 * @returns Le numéro formaté (XXX) XXX-XXXX ou partiellement formaté si < 10 chiffres
 */
export function formatPhoneDisplay(phone: string): string {
  // Extraire SEULEMENT les chiffres
  const digits = extractPhoneDigits(phone)

  // Si pas de chiffres, retourner vide
  if (digits.length === 0) {
    return ""
  }

  // Formatage progressif selon le nombre de chiffres
  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 6) {
    return `(${digits.substring(0, 3)}) ${digits.substring(3)}`
  }
  // 7+ chiffres : formatage complet
  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
}

/**
 * Valide que le téléphone a exactement 10 chiffres
 * @param phone - Le numéro formaté ou brut
 * @returns true si exactement 10 chiffres, false sinon
 */
export function isValidPhoneLength(phone: string | null): boolean {
  if (!phone || phone.trim().length === 0) {
    return true // Téléphone optionnel
  }
  const digits = extractPhoneDigits(phone.trim())
  return digits.length === 10
}

/**
 * Obtient le message d'erreur pour un numéro de téléphone
 * @param phone - Le numéro formaté ou brut
 * @returns Le message d'erreur ou null si valide
 */
export function getPhoneErrorMessage(phone: string | null): string | null {
  if (!phone || phone.trim().length === 0) {
    return null // Téléphone optionnel
  }
  const digits = extractPhoneDigits(phone.trim())
  if (digits.length !== 10) {
    return "Le numéro de téléphone doit contenir exactement 10 chiffres"
  }
  return null
}
