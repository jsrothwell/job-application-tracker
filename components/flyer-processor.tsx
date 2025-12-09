"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react"

interface Flyer {
  id: string
  url: string
  store: string
  status: "processing" | "processed" | "error"
  logo: string
}

interface FlyerProcessorProps {
  flyers: Flyer[]
  setFlyers: (flyers: Flyer[]) => void
}

export function FlyerProcessor({ flyers, setFlyers }: FlyerProcessorProps) {
  const [newUrl, setNewUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const addFlyer = async () => {
    if (newUrl.trim()) {
      const newFlyer: Flyer = {
        id: Date.now().toString(),
        url: newUrl,
        store: extractStoreName(newUrl),
        status: "processing",
        logo: getStoreLogo(newUrl),
      }

      setFlyers([...flyers, newFlyer])
      setNewUrl("")
      setIsProcessing(true)

      // Simulate AI processing
      setTimeout(() => {
        setFlyers(
          flyers
            .map((f) => (f.id === newFlyer.id ? { ...f, status: "processed" as const } : f))
            .concat({ ...newFlyer, status: "processed" as const }),
        )
        setIsProcessing(false)
      }, 2000)
    }
  }

  const extractStoreName = (url: string): string => {
    const domain = url.toLowerCase()
    if (domain.includes("walmart")) return "Walmart"
    if (domain.includes("target")) return "Target"
    if (domain.includes("kroger")) return "Kroger"
    if (domain.includes("safeway")) return "Safeway"
    if (domain.includes("costco")) return "Costco"
    return "Store"
  }

  const getStoreLogo = (url: string): string => {
    const domain = url.toLowerCase()
    if (domain.includes("walmart")) return "🏪"
    if (domain.includes("target")) return "🎯"
    if (domain.includes("kroger")) return "🛒"
    if (domain.includes("safeway")) return "🏬"
    if (domain.includes("costco")) return "📦"
    return "🏪"
  }

  const deleteFlyer = (id: string) => {
    setFlyers(flyers.filter((f) => f.id !== id))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add Flyer</CardTitle>
          <CardDescription>Paste store flyer URLs to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flyer-url">Flyer URL</Label>
            <Input
              id="flyer-url"
              placeholder="https://walmart.com/weekly-ad"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFlyer()}
            />
          </div>
          <Button onClick={addFlyer} className="w-full" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Flyer
              </>
            )}
          </Button>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Supported Stores</p>
            <div className="flex flex-wrap gap-2">
              {["Walmart", "Target", "Kroger", "Safeway", "Costco"].map((store) => (
                <Badge key={store} variant="secondary">
                  {store}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Active Flyers</CardTitle>
          <CardDescription>{flyers.length} flyers being tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flyers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No flyers added yet</p>
                <p className="text-sm text-muted-foreground">Add store flyer URLs to find savings</p>
              </div>
            ) : (
              flyers.map((flyer) => (
                <div key={flyer.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                    {flyer.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{flyer.store}</span>
                      {flyer.status === "processing" && (
                        <Badge variant="secondary" className="gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing
                        </Badge>
                      )}
                      {flyer.status === "processed" && (
                        <Badge className="gap-1 bg-accent text-accent-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          Processed
                        </Badge>
                      )}
                      {flyer.status === "error" && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                    <a
                      href={flyer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{flyer.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteFlyer(flyer.id)}>
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Receipt({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}
