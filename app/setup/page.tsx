import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

async function setupDatabase() {
  "use server"

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Create the job_applications table
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS job_applications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          company TEXT NOT NULL,
          position TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'applied',
          applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);

        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own applications" ON job_applications;
        CREATE POLICY "Users can view their own applications" ON job_applications
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own applications" ON job_applications;
        CREATE POLICY "Users can insert their own applications" ON job_applications
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own applications" ON job_applications;
        CREATE POLICY "Users can update their own applications" ON job_applications
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete their own applications" ON job_applications;
        CREATE POLICY "Users can delete their own applications" ON job_applications
          FOR DELETE USING (auth.uid() = user_id);
      `,
    })

    if (tableError) {
      console.error("[v0] Database setup error:", tableError)
      return { success: false, error: tableError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Setup failed:", error)
    return { success: false, error: String(error) }
  }
}

export default async function SetupPage() {
  const result = await setupDatabase()

  if (result.success) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">Database Setup</h1>
        {result.success === false && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">Setup Failed</p>
            <p className="text-sm">{result.error}</p>
            <p className="mt-4 text-sm">Please run the SQL manually in Supabase:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy the SQL from scripts/01-create-job-applications-table.sql</li>
              <li>Run it in the SQL Editor</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
