/**
 * Get default start and end times for a partial replacement based on shift type
 */
export function getDefaultReplacementTimes(shiftType: string): { startTime: string; endTime: string } {
  switch (shiftType) {
    case "day":
      return { startTime: "07:00", endTime: "17:00" }
    case "night":
      return { startTime: "17:00", endTime: "07:00" }
    case "full_24h":
      return { startTime: "07:00", endTime: "07:00" }
    default:
      return { startTime: "07:00", endTime: "17:00" }
  }
}

/**
 * Get min and max times for partial shifts based on shift type
 * Handles night shifts that cross midnight (min > max)
 */
export function getPartialShiftLimits(shiftType: string): { min: string; max: string } {
  switch (shiftType) {
    case "day":
      return { min: "07:00", max: "17:00" }
    case "night":
      return { min: "17:00", max: "07:00" }  // min > max (crosses midnight)
    case "full_24h":
      return { min: "00:00", max: "23:59" }
    default:
      return { min: "07:00", max: "17:00" }
  }
}
