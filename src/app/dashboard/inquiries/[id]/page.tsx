"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ContactInquiry } from "@/lib/supabase/enhanced-types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card" // Assuming Card components exist based on Orders page
import { Separator } from "@/shared/ui/separator"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays
} from "lucide-react"

export default function InquiryDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("contact_inquiries")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setInquiry(data)
      } catch (error) {
        console.error("Error fetching inquiry:", error)
        toast.error("Failed to load inquiry details")
        router.push("/dashboard/inquiries")
      } finally {
        setLoading(false)
      }
    }

    fetchInquiry()
  }, [params.id, router])

  const updateStatus = async (newStatus: 'new' | 'solved' | 'ignored') => {
    if (!inquiry) return

    try {
      const { error } = await (supabase as any)
        .from("contact_inquiries")
        .update({ status: newStatus })
        .eq("id", inquiry.id)

      if (error) throw error

      setInquiry({ ...inquiry, status: newStatus })
      toast.success(`Marked as ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <AlertCircle className="h-3.5 w-3.5" />
             <span className="capitalize">New</span>
          </Badge>
        )
      case "solved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <CheckCircle2 className="h-3.5 w-3.5" />
             <span className="capitalize">Solved</span>
          </Badge>
        )
      case "ignored":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <XCircle className="h-3.5 w-3.5" />
             <span className="capitalize">Ignored</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <span className="capitalize">{status}</span>
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto min-h-screen bg-slate-50/50 flex flex-col gap-6">
        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    )
  }

  if (!inquiry) return null

  return (
    <div className="p-8 max-w-[1000px] mx-auto min-h-screen bg-white font-sans">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="pl-0 hover:pl-2 transition-all text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inquiries
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {inquiry.subject || "No Subject"}
            </h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
               <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
               </span>
               <span className="text-slate-300">•</span>
               <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(inquiry.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {getStatusBadge(inquiry.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Message Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-4">
               <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  Message Content
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                {inquiry.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sender Details & Actions */}
        <div className="space-y-6">
           <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                 <CardTitle className="text-base font-semibold text-slate-800">Sender Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="p-4 flex items-center gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                       <User className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-slate-900">{inquiry.name}</p>
                       <p className="text-xs text-slate-500">Customer Name</p>
                    </div>
                 </div>
                 
                 <div className="p-4 flex items-center gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                       <Mail className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-sm font-medium text-slate-900 truncate" title={inquiry.email}>{inquiry.email}</p>
                       <p className="text-xs text-slate-500">Email Address</p>
                    </div>
                 </div>

                 {inquiry.phone && (
                    <div className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                          <Phone className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-slate-900">{inquiry.phone}</p>
                          <p className="text-xs text-slate-500">Phone Number</p>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                 <CardTitle className="text-base font-semibold text-slate-800">Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                 {inquiry.status !== 'solved' && (
                    <Button 
                       className="w-full justify-start bg-green-600 hover:bg-green-700 text-white shadow-sm"
                       onClick={() => updateStatus('solved')}
                    >
                       <CheckCircle2 className="mr-2 h-4 w-4" />
                       Mark as Solved
                    </Button>
                 )}
                 {inquiry.status !== 'new' && (
                    <Button 
                       variant="outline"
                       className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                       onClick={() => updateStatus('new')}
                    >
                       <AlertCircle className="mr-2 h-4 w-4" />
                       Mark as New
                    </Button>
                 )}
                 {inquiry.status !== 'ignored' && (
                    <Button 
                       variant="outline"
                       className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
                       onClick={() => updateStatus('ignored')}
                    >
                       <XCircle className="mr-2 h-4 w-4" />
                       Mark as Ignored
                    </Button>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
