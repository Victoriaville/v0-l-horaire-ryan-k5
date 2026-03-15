const LEAVE_BANKS_MAP: Record<string, string> = {
  fete_chomee: "Fête chômée",
  vacances: "Vacances",
  maladie: "Maladie",
  reconnaissance: "Reconnaissance",
  modulation: "Modulation",
  arret_travail: "Arrêt de travail",
  formation: "Formation",
  conge_social: "Congé social",
}

export function formatReplacementTime(isPartial: boolean, startTime?: string | null, endTime?: string | null): string {
  if (!isPartial || !startTime || !endTime) {
    return ""
  }
  return ` (${startTime} à ${endTime})`
}

export function getReplacementTypeLabel(isPartial: boolean): string {
  return isPartial ? "Remplacement partiel" : "Remplacement complet"
}

export function formatLeaveBanks(
  bank1?: string | null,
  hours1?: string | null,
  bank2?: string | null,
  hours2?: string | null
): string {
  if (!bank1 || bank1 === "none") {
    return ""
  }

  const parts: string[] = []

  // Format bank 1
  const label1 = LEAVE_BANKS_MAP[bank1] || bank1
  if (hours1 && hours1 !== "none") {
    parts.push(`${label1} (${hours1}h)`)
  } else {
    parts.push(label1)
  }

  // Format bank 2 if present
  if (bank2 && bank2 !== "none") {
    const label2 = LEAVE_BANKS_MAP[bank2] || bank2
    if (hours2 && hours2 !== "none") {
      parts.push(`${label2} (${hours2}h)`)
    } else {
      parts.push(label2)
    }
  }

  return parts.join(" + ")
}
