"use client"

import OrderDetailsPage from "@/app/dashboard/pages/OrderDetailsPage"

export default function Page({ params }: { params: { id: string } }) {
  return <OrderDetailsPage id={params.id} />
}
