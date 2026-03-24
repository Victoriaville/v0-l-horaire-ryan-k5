"use client"

import dynamic from "next/dynamic"

const MobileNav = dynamic(() => import("@/components/mobile-nav").then((mod) => mod.MobileNav), {
  ssr: false,
})

export interface MobileNavWrapperProps {
  userName: string
  isAdmin: boolean
  replacementsBadgeCount: number
  exchangesBadgeCount: number
  absencesBadgeCount: number
  notificationErrorsCount: number
}

export function MobileNavWrapper({
  userName,
  isAdmin,
  replacementsBadgeCount,
  exchangesBadgeCount,
  absencesBadgeCount,
  notificationErrorsCount,
}: MobileNavWrapperProps) {
  return (
    <MobileNav
      userName={userName}
      isAdmin={isAdmin}
      replacementsBadgeCount={replacementsBadgeCount}
      exchangesBadgeCount={exchangesBadgeCount}
      absencesBadgeCount={absencesBadgeCount}
      notificationErrorsCount={notificationErrorsCount}
    />
  )
}
