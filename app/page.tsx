import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobApplicationList } from "@/components/job-application-list"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Job Application Tracker</h1>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <JobApplicationList userId={user.id} />
      </main>
    </div>
  )
}
