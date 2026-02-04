"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ContactInquiry } from "@/lib/supabase/enhanced-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select"
import { toast } from "sonner"
import { 
  Loader2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  AlertCircle,
  Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

export default function InquiriesPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      let query = (supabase as any)
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setInquiries(data as any || [])
    } catch (error) {
      console.error("Error fetching inquiries:", error)
      toast.error("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [filter, search])

  const updateStatus = async (id: string, newStatus: 'solved' | 'ignored' | 'new') => {
    try {
      const { error } = await (supabase as any)
        .from("contact_inquiries")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) throw error

      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i))
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
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inquiries</h1>
          <p className="text-slate-500 mt-2 text-base">Manage and respond to customer messages.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchInquiries} variant="outline" size="sm" className="h-9 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <RefreshCw className="mr-2 h-4 w-4" /> 
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search inquiries..." 
            className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all w-full md:max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-8 w-px bg-slate-200 hidden md:block" />
          <Filter className="h-4 w-4 text-slate-400 hidden md:block" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-10 border-slate-200 bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
              <TableHead className="w-[250px] py-4 pl-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Sender Details</TableHead>
              <TableHead className="w-[200px] py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</TableHead>
              <TableHead className="min-w-[350px] py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Message Preview</TableHead>
              <TableHead className="w-[140px] py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="w-[150px] py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
              <TableHead className="w-[100px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <span className="text-sm font-medium">Loading inquiries...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <MessageSquare className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No inquiries found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Adjust your filters or check back later for new messages.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow 
                  key={inquiry.id} 
                  className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                  onClick={() => router.push(`/dashboard/inquiries/${inquiry.id}`)}
                >
                  <TableCell className="align-top py-5 pl-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900 text-[15px]">{inquiry.name}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[180px]" title={inquiry.email}>{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Phone className="h-3 w-3" />
                          <span>{inquiry.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-5">
                    <span className="text-sm font-medium text-slate-700 block truncate max-w-[180px]" title={inquiry.subject || "No Subject"}>
                      {inquiry.subject || "No Subject"}
                    </span>
                  </TableCell>
                  <TableCell className="align-top py-5">
                    <p className="text-sm text-slate-500 leading-relaxed font-normal line-clamp-2 max-w-xl">
                      {inquiry.message}
                    </p>
                  </TableCell>
                  <TableCell className="align-top py-5">
                    {getStatusBadge(inquiry.status)}
                  </TableCell>
                  <TableCell className="align-top py-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-[11px] text-slate-400 pl-5 mt-0.5">
                      {new Date(inquiry.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                           size="sm"
                           variant="ghost"
                           className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-full"
                           onClick={() => router.push(`/dashboard/inquiries/${inquiry.id}`)}
                           title="View Details"
                        >
                           <Eye className="h-4.5 w-4.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-34">
                           <DropdownMenuLabel className="text-xs text-slate-500">Change Status</DropdownMenuLabel>
                           <DropdownMenuSeparator />
                           {inquiry.status !== 'solved' && (
                              <DropdownMenuItem onClick={() => updateStatus(inquiry.id, 'solved')} className="text-xs">
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark Solved
                              </DropdownMenuItem>
                           )}
                           {(inquiry.status as string) !== 'new' && (
                              <DropdownMenuItem onClick={() => updateStatus(inquiry.id, 'new')} className="text-xs">
                                <AlertCircle className="mr-2 h-3.5 w-3.5" /> Mark New
                              </DropdownMenuItem>
                           )}
                           {inquiry.status !== 'ignored' && (
                              <DropdownMenuItem onClick={() => updateStatus(inquiry.id, 'ignored')} className="text-xs">
                                <XCircle className="mr-2 h-3.5 w-3.5" /> Mark Ignored
                              </DropdownMenuItem>
                           )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
