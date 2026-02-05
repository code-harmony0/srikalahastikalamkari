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
import { Button } from "@/app/dashboard/ui/button"
import { Input } from "@/app/dashboard/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/dashboard/ui/select"
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
// Dropdown imports removed as requested to show direct actions

export default function InquiriesPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 15

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = (supabase as any)
        .from("contact_inquiries")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      setInquiries(data as any || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error fetching inquiries:", error)
      toast.error("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [filter, search, page])

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
          <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <AlertCircle className="h-3.5 w-3.5" />
             <span className="capitalize">New</span>
          </Badge>
        )
      case "solved":
        return (
          <Badge variant="outline" className="bg-slate-900 text-white border-slate-900 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <CheckCircle2 className="h-3.5 w-3.5" />
             <span className="capitalize">Solved</span>
          </Badge>
        )
      case "ignored":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
             <XCircle className="h-3.5 w-3.5" />
             <span className="capitalize">Ignored</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
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
            <SelectTrigger className="w-full md:w-[200px] h-10 border-slate-200 bg-white rounded-xl focus:ring-slate-900">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
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
              <TableHead className="w-[200px] py-3 pl-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sender Details</TableHead>
              <TableHead className="w-[180px] py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Subject</TableHead>
              <TableHead className="min-w-[300px] py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Message Preview</TableHead>
              <TableHead className="w-[120px] py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="w-[140px] py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
              <TableHead className="w-[220px] py-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</TableHead>
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
                  <TableCell className="align-middle py-3 pl-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900 text-[15px] tracking-tight">{inquiry.name}</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="truncate max-w-[140px]" title={inquiry.email}>{inquiry.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-3 hidden md:table-cell">
                    <span className="text-sm font-medium text-slate-700 block truncate max-w-[140px]" title={inquiry.subject || "No Subject"}>
                      {inquiry.subject || "No Subject"}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle py-3 hidden lg:table-cell">
                    <p className="text-sm text-slate-500 leading-snug font-normal line-clamp-1 max-w-sm">
                      {inquiry.message}
                    </p>
                  </TableCell>
                  <TableCell className="align-middle py-3">
                    {getStatusBadge(inquiry.status)}
                  </TableCell>
                  <TableCell className="align-middle py-3">
                    <div className="text-sm text-slate-600 font-medium whitespace-nowrap">
                      {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-2 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View action handled by row click */}
                        
                        {inquiry.status !== 'solved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all rounded-lg gap-1.5"
                            onClick={() => updateStatus(inquiry.id, 'solved')}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Solve
                          </Button>
                        )}

                        {inquiry.status !== 'ignored' && (
                          <Button
                            size="sm"
                            variant="outline" 
                            className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all rounded-lg gap-1.5"
                            onClick={() => updateStatus(inquiry.id, 'ignored')}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Ignore
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{Math.min((page - 1) * itemsPerPage + 1, totalCount)}-{Math.min(page * itemsPerPage, totalCount)}</span> of <span className="font-medium text-slate-900">{totalCount}</span> inquiries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                const totalPages = Math.ceil(totalCount / itemsPerPage);
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) {
                    pNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pNum = totalPages - 4 + i;
                  } else {
                    pNum = page - 2 + i;
                  }
                }
                if (pNum > totalPages) return null;
                
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === pNum ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
              disabled={page >= Math.ceil(totalCount / itemsPerPage) || loading}
              className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
