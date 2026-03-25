import type React from "react"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  // This layout wraps the settings pages and doesn't have the password_force_reset redirect
  // The parent dashboard layout already handles auth checks
  return <>{children}</>
