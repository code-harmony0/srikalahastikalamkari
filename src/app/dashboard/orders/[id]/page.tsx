"use client"

import { useParams } from "next/navigation"
import OrderDetailsPage from "@/app/dashboard/pages/OrderDetailsPage"

export default function Page() {
  const params = useParams()
  const id = params?.id as string
  
  if (!id) return null // Wait for params to be available
  
  return <OrderDetailsPage id={id} />
}
