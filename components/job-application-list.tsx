"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { AddApplicationDialog } from "@/components/add-application-dialog"

interface JobApplication {
  id: string
  company: string
  position: string
  status: string
  applied_date: string
  notes?: string
}

export function JobApplicationList({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .order("applied_date", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("[v0] Error loading applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-500/10 text-blue-500"
      case "interview":
        return "bg-yellow-500/10 text-yellow-500"
      case "offer":
        return "bg-green-500/10 text-green-500"
      case "rejected":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Applications</h2>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No applications yet. Start tracking your job search!</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle className="text-lg">{app.position}</CardTitle>
                <CardDescription>{app.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(app.applied_date).toLocaleDateString()}
                  </span>
                </div>
                {app.notes && <p className="text-sm text-muted-foreground line-clamp-2">{app.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        onSuccess={loadApplications}
      />
    </div>
  )
}
