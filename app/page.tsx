import { redirect } from "next/navigation"
import { getSession } from "@/app/actions/auth"

export default async function HomePage() {
  const user = await getSession()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
