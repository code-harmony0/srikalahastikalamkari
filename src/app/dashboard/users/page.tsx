"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Check, Eye, EyeOff, Loader2, ShieldCheck, SlidersHorizontal, UserPlus, Users, KeyRound, ShieldAlert, Laptop, MoreHorizontal, Edit, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/app/dashboard/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/dashboard/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Input } from "@/app/dashboard/ui/input"
import { Badge } from "@/shared/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type StaffRole = "super_admin" | "operations" | "sales_staff"
type Permission = "dashboard.view" | "orders.view" | "orders.manage" | "products.view" | "products.manage" | "categories.manage" | "inquiries.manage" | "reviews.manage" | "featured.manage" | "promotions.manage" | "team.manage"
type AdminUser = { id: string; name: string; email: string; role: StaffRole; permissions: Permission[]; is_active: boolean; created_at: string }

const roleLabel: Record<StaffRole, string> = { super_admin: "Super admin", operations: "Operations", sales_staff: "Sales staff" }
const roleDefaults: Record<Exclude<StaffRole, "super_admin">, Permission[]> = {
  operations: ["dashboard.view", "orders.view", "orders.manage", "products.view", "products.manage", "inquiries.manage", "reviews.manage", "featured.manage"],
  sales_staff: ["dashboard.view", "orders.view", "orders.manage", "inquiries.manage"],
}
const accessAreas: Array<{ title: string; description: string; permissions: Array<{ key: Permission; label: string }> }> = [
  { title: "Order desk", description: "Daily customer and fulfilment work", permissions: [{ key: "orders.view", label: "See orders" }, { key: "orders.manage", label: "Update order status" }, { key: "inquiries.manage", label: "Reply to enquiries" }] },
  { title: "Catalogue", description: "Products and presentation", permissions: [{ key: "products.view", label: "See products" }, { key: "products.manage", label: "Edit products" }, { key: "featured.manage", label: "Manage featured work" }] },
  { title: "Trust & campaigns", description: "Customer-facing publishing", permissions: [{ key: "reviews.manage", label: "Moderate reviews" }, { key: "promotions.manage", label: "Manage offers" }] },
]

const canUse = (role: Exclude<StaffRole, "super_admin">, permission: Permission) => roleDefaults[role].includes(permission)

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales_staff" as Exclude<StaffRole, "super_admin">, permissions: roleDefaults.sales_staff })

  async function loadUsers() {
    setLoading(true)
    const response = await fetch("/api/admin/users", { cache: "no-store" })
    const payload = await response.json() as { users?: AdminUser[]; error?: string }
    if (response.ok) setUsers(payload.users ?? [])
    else setMessage(payload.error ?? "Unable to load staff accounts.")
    setLoading(false)
  }
  useEffect(() => { void loadUsers() }, [])
  const activeUsers = useMemo(() => users.filter((user) => user.is_active).length, [users])
  const staffUsers = useMemo(() => users.filter((user) => user.role !== "super_admin").length, [users])

  function chooseRole(role: Exclude<StaffRole, "super_admin">) { setForm((current) => ({ ...current, role, permissions: roleDefaults[role] })) }
  function togglePermission(permission: Permission) { if (!canUse(form.role, permission)) return; setForm((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] })) }
  
  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(null)
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const payload = await response.json() as { user?: AdminUser; error?: string }
    if (response.ok && payload.user) { 
      setUsers((current) => [...current, payload.user as AdminUser]); 
      setForm({ name: "", email: "", password: "", role: "sales_staff", permissions: roleDefaults.sales_staff }); 
      setMessage("Staff login created. Give the temporary password privately.") 
      setIsFormOpen(false)
    } else {
      setMessage(payload.error ?? "Unable to create the staff account.")
    }
    setSaving(false)
  }
  
  async function updateUser(user: AdminUser, update: Record<string, unknown>) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, ...update }) })
    const payload = await response.json() as { user?: AdminUser; error?: string }
    if (response.ok && payload.user) {
      setUsers((current) => current.map((item) => item.id === user.id ? payload.user as AdminUser : item))
    } else {
      setMessage(payload.error ?? "Unable to update the staff account.")
    }
  }

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-8 pb-12 pt-4 text-slate-900"
    >
      <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-4 sm:px-0">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Workspace Settings</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Team & Access</h1>
          <p className="mt-2 max-w-xl text-base text-slate-500 leading-relaxed">
            Manage your team directory. Give each person their own login and only the dashboard controls they need for their work.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50/80 px-4 py-2 border border-emerald-100 text-sm font-medium text-emerald-700 shadow-sm self-start sm:self-end">
          <ShieldCheck className="h-4 w-4" /> 
          Server-enforced access
        </div>
      </motion.header>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden px-4 sm:px-0"
          >
            <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
              <div className="rounded-full bg-emerald-100 p-1"><Check className="h-4 w-4 text-emerald-600" /></div>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 px-4 sm:px-0">
        <div className="col-span-2 sm:col-span-1">
            <Metric icon={<Users className="h-5 w-5" />} label="Team accounts" value={users.length} detail="Owner and staff" color="blue" />
        </div>
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Active now" value={activeUsers} detail="Can sign in" color="emerald" />
        <Metric icon={<UserPlus className="h-5 w-5" />} label="Staff members" value={staffUsers} detail="Non-owner accounts" color="violet" />
      </motion.div>

      <motion.div variants={itemVariants} className="px-4 sm:px-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Team Management</h2>
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="rounded-full px-5 shadow-sm bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            {isFormOpen ? "Cancel" : <><UserPlus className="mr-2 h-4 w-4" /> Add New Staff</>}
          </Button>
        </div>
        
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
              animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
              exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mb-8"
            >
              <Card className="overflow-hidden border-slate-200 shadow-md">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
                  <CardTitle className="text-lg">Create staff login</CardTitle>
                  <CardDescription className="text-sm">Start with a job type, then choose only the relevant dashboard controls.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={createUser} className="grid md:grid-cols-[1.2fr_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-6 md:p-8 space-y-6 bg-white">
                      <div className="space-y-4">
                        <Field label="Staff name">
                          <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Naveen Kumar" />
                        </Field>
                        <Field label="Login email">
                          <Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="staff@store.com" />
                        </Field>
                        <Field label="Temporary password">
                          <div className="relative">
                            <Input required minLength={12} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 12 characters" className="pr-11" />
                            <button type="button" className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-semibold text-slate-700">Job type</label>
                        <div className="grid grid-cols-2 gap-3">
                          <RoleChoice active={form.role === "sales_staff"} label="Sales desk" icon={<Laptop className="h-4 w-4" />} onClick={() => chooseRole("sales_staff")} />
                          <RoleChoice active={form.role === "operations"} label="Operations" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => chooseRole("operations")} />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between pt-4 mt-8 border-t border-slate-100 gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <KeyRound className="h-3 w-3" /> Encrypted storage
                        </div>
                        <Button type="submit" disabled={saving} className="rounded-full px-6 transition-all hover:shadow-md w-full sm:w-auto">
                          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                          {saving ? "Creating…" : "Create login"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-6 md:p-8 flex flex-col">
                      <AccessPicker role={form.role} selected={form.permissions} onToggle={togglePermission} />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants} className="px-4 sm:px-0">
        <Card className="overflow-hidden border-slate-200 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50/50 py-5 gap-4">
            <div>
              <CardTitle className="text-lg">Team directory</CardTitle>
              <CardDescription className="mt-1 text-sm">Change access as responsibilities change. Owner access is protected.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white shrink-0 self-start sm:self-auto">{users.length} total</Badge>
          </CardHeader>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="w-[250px]">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300 mb-2" />
                      Loading directory...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      <Users className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                      No staff accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                          {roleLabel[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          {user.role === "super_admin" ? (
                            <><ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> All controls</>
                          ) : (
                            <><SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" /> {user.permissions.length} permissions</>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${user.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(user.created_at))}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {user.role !== "super_admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
                              <MoreHorizontal className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => setEditing(user)} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2 text-slate-500" /> Edit Access
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => void updateUser(user, { isActive: !user.is_active })} 
                                className={`cursor-pointer ${user.is_active ? "text-red-600 focus:text-red-600" : "text-emerald-600 focus:text-emerald-600"}`}
                              >
                                {user.is_active ? (
                                  <><Ban className="w-4 h-4 mr-2" /> Suspend Staff</>
                                ) : (
                                  <><CheckCircle className="w-4 h-4 mr-2" /> Enable Staff</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300 mb-2" />
                <span className="text-sm">Loading directory...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-500">
                <Users className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                <span className="text-sm">No staff accounts found.</span>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 bg-white flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                    {user.role !== "super_admin" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
                          <MoreHorizontal className="w-5 h-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => setEditing(user)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2 text-slate-500" /> Edit Access
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => void updateUser(user, { isActive: !user.is_active })} 
                            className={`cursor-pointer ${user.is_active ? "text-red-600 focus:text-red-600" : "text-emerald-600 focus:text-emerald-600"}`}
                          >
                            {user.is_active ? (
                              <><Ban className="w-4 h-4 mr-2" /> Suspend</>
                            ) : (
                              <><CheckCircle className="w-4 h-4 mr-2" /> Enable</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 font-medium text-slate-700">
                      {roleLabel[user.role]}
                    </Badge>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${user.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                      <span className={`h-1 w-1 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mt-1">
                    <span className="inline-flex items-center gap-1">
                      {user.role === "super_admin" ? (
                        <><ShieldAlert className="h-3 w-3 text-amber-500" /> All controls</>
                      ) : (
                        <><SlidersHorizontal className="h-3 w-3 text-slate-400" /> {user.permissions.length} permissions</>
                      )}
                    </span>
                    <span>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(user.created_at))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && <AccessDialog user={editing} onSave={async (role, permissions) => { await updateUser(editing, { role, permissions }); setEditing(null) }} />}
      </Dialog>
    </motion.section>
  )
}

function Metric({ icon, label, value, detail, color = "blue" }: { icon: React.ReactNode; label: string; value: number; detail: string; color?: "blue" | "emerald" | "violet" }) { 
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  }
  
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md group h-full">
      <CardContent className="flex flex-col sm:flex-row sm:items-start justify-between p-4 sm:p-6 gap-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{label}</p>
          <p className="mt-1 sm:mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-slate-400">{detail}</p>
        </div>
        <div className={`rounded-xl border p-2 sm:p-3 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 self-start ${colorMap[color]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  ) 
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { 
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  ) 
}

function RoleChoice({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) { 
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border p-4 text-left text-sm transition-all duration-200 ${
        active 
          ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20" 
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className={`rounded-md p-1.5 ${active ? "bg-white/20" : "bg-slate-100"}`}>
        {icon}
      </div>
      <span className="font-semibold">{label}</span>
      {active && (
        <motion.div 
          layoutId="role-active-indicator" 
          className="absolute inset-0 border-2 border-slate-900 rounded-xl"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  ) 
}

function AccessPicker({ role, selected, onToggle }: { role: Exclude<StaffRole, "super_admin">; selected: Permission[]; onToggle: (permission: Permission) => void }) { 
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Dashboard controls
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">Customize the specific actions and areas this staff member can access.</p>
      </div>
      
      <div className="space-y-6 flex-1">
        {accessAreas.map((area) => {
          const visiblePermissions = area.permissions.filter(({ key }) => canUse(role, key));
          if (visiblePermissions.length === 0) return null;

          return (
            <div key={area.title} className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-900">{area.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{area.description}</p>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {visiblePermissions.map(({ key, label }) => { 
                  const active = selected.includes(key); 
                  return (
                    <button 
                      type="button" 
                      key={key} 
                      onClick={() => onToggle(key)} 
                      className={`group flex items-center gap-3 rounded-lg border p-2.5 text-left text-sm transition-all duration-200 ${
                        active 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                        active 
                          ? "border-emerald-600 bg-emerald-600 text-white" 
                          : "border-slate-300 bg-white group-hover:border-emerald-400"
                      }`}>
                        {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <span className="font-medium">{label}</span>
                    </button> 
                  ) 
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) 
}

function AccessDialog({ user, onSave }: { user: AdminUser; onSave: (role: Exclude<StaffRole, "super_admin">, permissions: Permission[]) => Promise<void> }) { 
  const [role, setRole] = useState(user.role as Exclude<StaffRole, "super_admin">); 
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions); 
  const [saving, setSaving] = useState(false); 
  
  function switchRole(nextRole: Exclude<StaffRole, "super_admin">) { 
    setRole(nextRole); 
    setPermissions(roleDefaults[nextRole]) 
  } 
  
  function toggle(permission: Permission) { 
    if (!canUse(role, permission)) return; 
    setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]) 
  } 
  
  return (
    <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 border-slate-200 shadow-xl w-[95vw] sm:w-full rounded-2xl">
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-left">Manage access · <span className="text-slate-500 font-normal">{user.name}</span></DialogTitle>
          <DialogDescription className="mt-1.5 text-sm sm:text-base text-left">Changes take effect next time this staff member signs in.</DialogDescription>
        </DialogHeader>
      </div>
      
      <div className="grid md:grid-cols-[200px_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100 max-h-[70vh] overflow-y-auto">
        <div className="p-5 sm:p-6 bg-slate-50/30 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Select job type</p>
          <div className="flex flex-col gap-3">
            <RoleChoice active={role === "sales_staff"} label="Sales desk" icon={<Laptop className="h-4 w-4" />} onClick={() => switchRole("sales_staff")} />
            <RoleChoice active={role === "operations"} label="Operations" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => switchRole("operations")} />
          </div>
        </div>
        
        <div className="p-5 sm:p-6 bg-white space-y-6">
          <AccessPicker role={role} selected={permissions} onToggle={toggle} />
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button size="lg" className="rounded-full shadow-sm w-full sm:w-auto" disabled={saving} onClick={async () => { setSaving(true); await onSave(role, permissions); setSaving(false) }}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Save access controls
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  ) 
}