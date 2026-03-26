/**
 * Valide les dates d'absence
 * @param startDate - Date de début au format YYYY-MM-DD
 * @param endDate - Date de fin au format YYYY-MM-DD
 * @returns Message d'erreur ou null si validation réussie
 */
export function validateLeafDates(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) {
    return "Les dates sont requises"
  }

  // Vérifier le format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(startDate)) {
    return "La date de début doit être au format YYYY-MM-DD"
  }
  if (!dateRegex.test(endDate)) {
    return "La date de fin doit être au format YYYY-MM-DD"
  }

  // Vérifier que ce sont des dates valides
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  if (isNaN(startDateObj.getTime())) {
    return "La date de début n'est pas valide"
  }
  if (isNaN(endDateObj.getTime())) {
    return "La date de fin n'est pas valide"
  }

  // Vérifier que startDate <= endDate
  if (startDateObj > endDateObj) {
    return "La date de fin doit être après ou égale à la date de début"
  }

  return null // Validation réussie
}

/**
 * Vérifie si les dates sont dans le passé (aujourd'hui compris)
 * @param startDate - Date de début au format YYYY-MM-DD
 * @returns true si au moins une date est dans le passé
 */
export function isDateInPast(startDate: string): boolean {
  // Parser la date ISO correctement pour éviter le décalage de fuseau horaire
  const [year, month, day] = startDate.split("-").map(Number)
  const date = new Date(year, month - 1, day) // month - 1 car JS compte les mois de 0-11
  date.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Ignorer l'heure

  return date < today
}

/**
 * Retourne un message d'avertissement si les dates sont dans le passé
 * @param startDate - Date de début au format YYYY-MM-DD
 * @returns Message d'avertissement ou null
 */
export function getPastDateWarning(startDate: string): string | null {
  if (isDateInPast(startDate)) {
    return "⚠️ Vous créez une absence antérieure à aujourd'hui"
  }
  return null
}
