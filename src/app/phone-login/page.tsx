import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm"

export default function PhoneLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512] p-4">
      <div className="bg-[#FAFAF8]/95 backdrop-blur-md border border-[#C19A5B]/20 rounded-2xl shadow-2xl p-8">
        <PhoneLoginForm />
      </div>
    </div>
  )
}
