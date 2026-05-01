"use client"

import { useEffect } from "react"

export function RefreshOnFocus() {
  useEffect(() => {
    const handleFocus = () => {
      window.location.reload()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  return null
}
