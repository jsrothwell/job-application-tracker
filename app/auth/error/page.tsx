"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")

  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const isOtpExpired = errorCode === "otp_expired" || error === "access_denied"

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsResending(true)
    setResendMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setResendMessage("Confirmation email sent! Please check your inbox.")
    } catch (error: unknown) {
      setResendMessage(error instanceof Error ? error.message : "Failed to resend email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isOtpExpired ? "Email Link Expired" : "Sorry, something went wrong."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isOtpExpired ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Your email confirmation link has expired or is invalid. Please request a new confirmation email
                      below.
                    </p>

                    <form onSubmit={handleResendConfirmation} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isResending}>
                        {isResending ? "Sending..." : "Resend Confirmation Email"}
                      </Button>

                      {resendMessage && (
                        <p className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-500"}`}>
                          {resendMessage}
                        </p>
                      )}
                    </form>
                  </>
                ) : (
                  <>
                    {error ? (
                      <p className="text-sm text-muted-foreground">Code error: {error}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
                    )}

                    {errorDescription && (
                      <p className="text-sm text-muted-foreground">
                        Description: {decodeURIComponent(errorDescription)}
                      </p>
                    )}
                  </>
                )}

                <div className="text-center">
                  <Link href="/auth/login" className="text-sm underline underline-offset-4">
                    Back to Login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
