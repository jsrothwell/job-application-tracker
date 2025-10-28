"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserIcon,
  LogOut,
  MoreVertical,
  ExternalLink,
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Heart,
  Archive,
  Star,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected" | "Follow-up" | "archived"

interface JobApplication {
  id: string
  company: string
  position: string
  location: string
  date_applied: string
  status: ApplicationStatus
  salary?: string
  notes?: string
  job_url?: string
  posting_online?: boolean
  user_id: string
  created_at: string
  updated_at: string
  hiring_manager?: string
}

const statusConfig = {
  Applied: { label: "Applied", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Building2 },
  Interview: { label: "Interview", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  Offer: { label: "Offer", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  Rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  "Follow-up": { label: "Follow-up", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Calendar },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-800 border-gray-200", icon: Archive },
}

const getStatusColor = (status: ApplicationStatus) => {
  const colors = {
    Applied: "#3b82f6", // blue
    Interview: "#f59e0b", // yellow
    Offer: "#10b981", // green
    Rejected: "#ef4444", // red
    "Follow-up": "#8b5cf6", // purple
    archived: "#6b7280", // gray
  }
  return colors[status]
}

const ITEMS_PER_PAGE = 12
const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48]

export function JobApplicationDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_applied")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showVisualization, setShowVisualization] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [favoriteApplications, setFavoriteApplications] = useState<Set<string>>(new Set())

  const [newApplication, setNewApplication] = useState({
    company: "",
    position: "",
    location: "",
    status: "Applied" as ApplicationStatus,
    salary: "",
    notes: "",
    job_url: "",
    posting_online: true,
    hiring_manager: "",
  })

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchApplications = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "archived") // Exclude archived applications
        .order(sortBy === "date_applied" ? "date_applied" : sortBy, { ascending: sortOrder === "asc" })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }, [user, sortBy, sortOrder])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      fetchApplications()
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth/login")
      } else if (session?.user) {
        setUser(session.user)
        fetchApplications()
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchApplications])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications, sortBy, sortOrder, statusFilter])

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("favoriteApplications")
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favoriteApplications")
      if (savedFavorites) {
        setFavoriteApplications(new Set(JSON.parse(savedFavorites)))
      }
    } catch (error) {
      console.error("[v0] Error loading favorites from localStorage:", error)
    }
  }, [])

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications]

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(lowerSearchTerm) ||
          app.position.toLowerCase().includes(lowerSearchTerm) ||
          app.location.toLowerCase().includes(lowerSearchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date_applied":
          comparison = new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime()
          break
        case "company":
          comparison = a.company.localeCompare(b.company)
          break
        case "position":
          comparison = a.position.localeCompare(b.position)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime()
      }
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder])

  const stats = useMemo(() => {
    const total = applications.filter((app) => app.status !== "archived").length
    const interviews = applications.filter((app) => app.status === "Interview").length
    const offers = applications.filter((app) => app.status === "Offer").length
    const favorited = favoriteApplications.size
    return { total, interviews, offers, favorited }
  }, [applications, favoriteApplications])

  const visualizationData = useMemo(() => {
    const relevantApplications = applications.filter((app) => app.status !== "archived")
    const statusCounts = relevantApplications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<ApplicationStatus, number>,
    )

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusConfig[status as ApplicationStatus].label,
      value: count,
      color: getStatusColor(status as ApplicationStatus),
    }))

    const barData = Object.entries(statusCounts).map(([status, count]) => ({
      status: statusConfig[status as ApplicationStatus].label,
      count,
      fill: getStatusColor(status as ApplicationStatus),
    }))

    return { pieData, barData }
  }, [applications])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleAddApplication = async () => {
    if (!newApplication.company || !newApplication.position || !newApplication.location || !user) {
      return
    }

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .insert([
          {
            company: newApplication.company,
            position: newApplication.position,
            location: newApplication.location,
            status: newApplication.status,
            salary: newApplication.salary || null,
            notes: newApplication.notes || null,
            job_url: newApplication.job_url || null,
            posting_online: newApplication.posting_online,
            user_id: user.id,
            date_applied: new Date().toISOString().split("T")[0],
            hiring_manager: newApplication.hiring_manager || null,
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setApplications((prev) => [data[0], ...prev])
      }

      setNewApplication({
        company: "",
        position: "",
        location: "",
        status: "Applied",
        salary: "",
        notes: "",
        job_url: "",
        posting_online: true,
        hiring_manager: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding application:", error)
    }
  }

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application)
    setIsEditDialogOpen(true)
  }

  const handleUpdateApplication = async () => {
    if (!editingApplication) return

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .update({
          company: editingApplication.company,
          position: editingApplication.position,
          location: editingApplication.location,
          status: editingApplication.status,
          salary: editingApplication.salary || null,
          notes: editingApplication.notes || null,
          job_url: editingApplication.job_url || null,
          posting_online: editingApplication.posting_online,
          hiring_manager: editingApplication.hiring_manager || null,
        })
        .eq("id", editingApplication.id)
        .select()

      if (error) throw error

      if (data) {
        setApplications((prev) => prev.map((app) => (app.id === editingApplication.id ? data[0] : app)))
      }

      setEditingApplication(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating application:", error)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase.from("job_applications").delete().eq("id", applicationId)

      if (error) throw error

      setApplications((prev) => prev.filter((app) => app.id !== applicationId))
    } catch (error) {
      console.error("Error deleting application:", error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedApplications.slice(startIndex, endIndex)
  }, [filteredAndSortedApplications, currentPage, itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredAndSortedApplications.length / itemsPerPage),
    [filteredAndSortedApplications, itemsPerPage],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    )
  }

  const handleCheckStatus = async (application: JobApplication) => {
    if (application.job_url) {
      window.open(application.job_url, "_blank", "noopener,noreferrer")
    }
  }

  const getCompanyLogo = (companyName: string) => {
    const initial = companyName.charAt(0).toUpperCase()
    return initial
  }

  const toggleFavorite = (applicationId: string) => {
    try {
      const newFavorites = new Set(favoriteApplications)
      if (newFavorites.has(applicationId)) {
        newFavorites.delete(applicationId)
      } else {
        newFavorites.add(applicationId)
      }
      setFavoriteApplications(newFavorites)
      localStorage.setItem("favoriteApplications", JSON.stringify([...newFavorites]))
    } catch (error) {
      console.error("[v0] Error toggling favorite:", error)
    }
  }

  const handleArchiveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase.from("job_applications").update({ status: "archived" }).eq("id", applicationId)

      if (error) throw error

      fetchApplications()
    } catch (error) {
      console.error("Error archiving application:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">Job Application Tracker</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Track and manage your job applications efficiently
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 min-h-[44px] px-3">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline truncate max-w-32">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setShowVisualization(!showVisualization)}
              className="min-h-[44px] px-3"
            >
              <BarChart3 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{showVisualization ? "Hide Charts" : "Show Charts"}</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] px-4">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Application</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Application</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={newApplication.company}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Job Title *</Label>
                    <Input
                      id="position"
                      value={newApplication.position}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newApplication.location}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newApplication.status}
                      onValueChange={(value: ApplicationStatus) =>
                        setNewApplication((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      value={newApplication.salary}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, salary: e.target.value }))}
                      placeholder="e.g. $120k - $160k"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newApplication.notes}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="job_url">Job Posting URL</Label>
                    <Input
                      id="job_url"
                      type="url"
                      value={newApplication.job_url}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, job_url: e.target.value }))}
                      placeholder="https://company.com/careers/job-id"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hiring_manager">Hiring Manager</Label>
                    <Input
                      id="hiring_manager"
                      value={newApplication.hiring_manager}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, hiring_manager: e.target.value }))}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="posting_online"
                      type="checkbox"
                      checked={newApplication.posting_online}
                      onChange={(e) => setNewApplication((prev) => ({ ...prev, posting_online: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <Label htmlFor="posting_online" className="text-sm">
                      Job posting is still online
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleAddApplication} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Add Application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Total Applications</h3>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Interviews Scheduled</h3>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{stats.interviews}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Offers Received</h3>
                <CheckCircle className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{stats.offers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Section */}
        {showVisualization && applications.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Application Status Overview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVisualization(false)}
                className="sm:hidden min-h-[44px]"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visualizationData.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {visualizationData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {visualizationData.pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-600">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Applications by Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visualizationData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="status"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <Tooltip
                          formatter={(value, name) => [value, "Applications"]}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search applications by company, position, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden h-12 px-4 border-gray-300"
          >
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <div className={`${showMobileFilters ? "block" : "hidden"} sm:block w-full sm:w-auto`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_applied">Date Applied</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredAndSortedApplications.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-sm text-gray-600 text-center mb-4 px-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find relevant job applications."
                  : "Get started by adding your first job application to track your progress."}
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {paginatedApplications.map((application) => {
                const StatusIcon = statusConfig[application.status].icon
                const isFavorite = favoriteApplications.has(application.id)

                return (
                  <Card
                    key={application.id}
                    className="group hover:shadow-md transition-all duration-200 bg-white border border-gray-200 hover:border-blue-200"
                  >
                    <CardHeader className="p-3 sm:p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm sm:text-base flex-shrink-0">
                            {getCompanyLogo(application.company)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate leading-tight">
                              {application.position}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">{application.company}</p>
                            {application.hiring_manager && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">HM: {application.hiring_manager}</p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500 truncate">{application.location}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditApplication(application)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Application
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFavorite(application.id)}>
                              {isFavorite ? (
                                <>
                                  <Heart className="w-4 h-4 mr-2 fill-current text-red-500" />
                                  Remove Favorite
                                </>
                              ) : (
                                <>
                                  <Heart className="w-4 h-4 mr-2" />
                                  Mark as Favorite
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchiveApplication(application.id)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteApplication(application.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{new Date(application.date_applied).toLocaleDateString()}</span>
                        </div>
                        {application.salary && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <DollarSign className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{application.salary}</span>
                          </div>
                        )}
                      </div>

                      {application.job_url && (
                        <div className="flex items-center justify-between text-xs gap-2">
                          <a
                            href={application.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 min-w-0 flex-1 group"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate group-hover:underline">View Job Posting</span>
                          </a>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {application.posting_online ? (
                              <Globe className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 gap-2">
                        <div className="flex items-center gap-1">
                          <Badge
                            className={`${statusConfig[application.status].color} border text-xs px-2 py-0.5 flex-shrink-0`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{statusConfig[application.status].label}</span>
                            <span className="sm:hidden">{statusConfig[application.status].label.slice(0, 3)}</span>
                          </Badge>
                          {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        </div>

                        {application.job_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckStatus(application)}
                            className="h-6 px-2 text-xs flex-shrink-0 hover:bg-primary/10"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Check Status</span>
                            <span className="sm:hidden">Check</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-sm px-4 h-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-sm px-4 h-10"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            {editingApplication && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-company">Company *</Label>
                  <Input
                    id="edit-company"
                    value={editingApplication.company}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, company: e.target.value } : null))
                    }
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-position">Job Title *</Label>
                  <Input
                    id="edit-position"
                    value={editingApplication.position}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, position: e.target.value } : null))
                    }
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input
                    id="edit-location"
                    value={editingApplication.location}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, location: e.target.value } : null))
                    }
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingApplication.status}
                    onValueChange={(value: ApplicationStatus) =>
                      setEditingApplication((prev) => (prev ? { ...prev, status: value } : null))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-salary">Salary Range</Label>
                  <Input
                    id="edit-salary"
                    value={editingApplication.salary || ""}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, salary: e.target.value } : null))
                    }
                    placeholder="e.g. $120k - $160k"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingApplication.notes || ""}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                    }
                    placeholder="Additional notes..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-job_url">Job Posting URL</Label>
                  <Input
                    id="edit-job_url"
                    type="url"
                    value={editingApplication.job_url || ""}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, job_url: e.target.value } : null))
                    }
                    placeholder="https://company.com/careers/job-id"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-hiring_manager">Hiring Manager</Label>
                  <Input
                    id="edit-hiring_manager"
                    value={editingApplication.hiring_manager || ""}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, hiring_manager: e.target.value } : null))
                    }
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="edit-posting_online"
                    type="checkbox"
                    checked={editingApplication.posting_online}
                    onChange={(e) =>
                      setEditingApplication((prev) => (prev ? { ...prev, posting_online: e.target.checked } : null))
                    }
                    className="rounded border-border"
                  />
                  <Label htmlFor="edit-posting_online" className="text-sm">
                    Job posting is still online
                  </Label>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleUpdateApplication} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                Update Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Warning Dialog */}
        <AlertDialog open={showLogoutWarning} onOpenChange={setShowLogoutWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
              <AlertDialogDescription>
                You will be automatically logged out in 5 minutes due to inactivity. Click "Stay Logged In" to continue
                your session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowLogoutWarning(false)}>Stay Logged In</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>Logout Now</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Built with v0 attribution */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <a href="https://v0.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              v0
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
