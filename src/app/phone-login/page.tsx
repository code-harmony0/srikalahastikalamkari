import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm"

export default function PhoneLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <PhoneLoginForm />
      </div>
    </div>
  )
}
