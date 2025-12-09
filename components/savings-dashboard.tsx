"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, DollarSign, ShoppingBag, MapPin } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StorePrice {
  store: string
  price: number
  regularPrice: number
  savings: number
}

interface Match {
  id: string
  item: string
  stores: StorePrice[]
}

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  brand: string
  checked: boolean
}

interface SavingsDashboardProps {
  matches: Match[]
  groceryItems: GroceryItem[]
}

export function SavingsDashboard({ matches, groceryItems }: SavingsDashboardProps) {
  const totalSavings = matches.reduce((acc, match) => {
    const bestPrice = Math.min(...match.stores.map((s) => s.savings))
    return acc + bestPrice
  }, 0)

  const bestStore = matches.reduce(
    (acc, match) => {
      match.stores.forEach((store) => {
        acc[store.store] = (acc[store.store] || 0) + store.savings
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topStore = Object.entries(bestStore).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This week's potential savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Matched</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{matches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {groceryItems.length} items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Store</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{topStore?.[0] || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">${topStore?.[1].toFixed(2) || "0.00"} in savings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Comparison</CardTitle>
          <CardDescription>Compare prices across stores to maximize your savings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Item</TableHead>
                  <TableHead className="font-semibold">Store</TableHead>
                  <TableHead className="font-semibold text-right">Sale Price</TableHead>
                  <TableHead className="font-semibold text-right">Regular</TableHead>
                  <TableHead className="font-semibold text-right">Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => {
                  const bestDeal = match.stores.reduce((best, current) => (current.price < best.price ? current : best))
                  return match.stores.map((store, idx) => (
                    <TableRow key={`${match.id}-${store.store}`} className={idx === 0 ? "border-t-2" : ""}>
                      {idx === 0 && (
                        <TableCell rowSpan={match.stores.length} className="font-medium">
                          {match.item}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{store.store}</span>
                          {store.store === bestDeal.store && (
                            <Badge className="bg-accent text-accent-foreground">Best</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-accent">${store.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground line-through">
                        ${store.regularPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-accent font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {store.savings.toFixed(2)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shopping Recommendations</CardTitle>
          <CardDescription>Optimized shopping strategy for maximum savings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(bestStore)
              .sort((a, b) => b[1] - a[1])
              .map(([store, savings]) => {
                const storeItems = matches.filter((m) =>
                  m.stores.some((s) => s.store === store && s.price === Math.min(...m.stores.map((st) => st.price))),
                )
                return (
                  <div key={store} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
                          {store === "Walmart" ? "🏪" : "🎯"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{store}</h3>
                          <p className="text-sm text-muted-foreground">{storeItems.length} best deals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">${savings.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">total savings</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {storeItems.map((item) => (
                        <Badge key={item.id} variant="secondary">
                          {item.item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
