import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm"

export default function PhoneLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))] p-4">
      <div className="bg-[hsl(var(--brand-paper)/0.95)] backdrop-blur-md border border-[hsl(var(--brand-gold)/0.2)] rounded-2xl shadow-2xl p-8">
        <PhoneLoginForm />
      </div>
    </div>
  )
}
