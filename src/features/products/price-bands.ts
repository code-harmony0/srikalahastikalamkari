// Price bands for the shop filter, cut where the catalogue actually sits:
// dupattas start around ₹1,300 and most sarees fall between ₹10,000 and
// ₹20,000. The open-ended top band has no ceiling, so nothing is hidden.
export const PRICE_BANDS = [
  { id: "under-2000", label: "Under ₹2,000", min: undefined, max: 1999 },
  { id: "2000-5000", label: "₹2,000 – ₹5,000", min: 2000, max: 4999 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 9999 },
  { id: "10000-20000", label: "₹10,000 – ₹20,000", min: 10000, max: 19999 },
  { id: "over-20000", label: "Over ₹20,000", min: 20000, max: undefined },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  min: number | undefined
  max: number | undefined
}>

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"]
