"use client"

import { useState } from "react"
import { GroceryListManager } from "@/components/grocery-list-manager"
import { FlyerProcessor } from "@/components/flyer-processor"
import { SavingsDashboard } from "@/components/savings-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Receipt, TrendingDown } from "lucide-react"

export default function Home() {
  const [groceryItems, setGroceryItems] = useState([
    { id: "1", name: "Milk", category: "Dairy", quantity: 2, brand: "Any", checked: false },
    { id: "2", name: "Bread", category: "Bakery", quantity: 1, brand: "Whole Wheat", checked: false },
    { id: "3", name: "Eggs", category: "Dairy", quantity: 1, brand: "Free Range", checked: false },
    { id: "4", name: "Chicken Breast", category: "Meat", quantity: 2, brand: "Any", checked: false },
    { id: "5", name: "Apples", category: "Produce", quantity: 6, brand: "Gala", checked: false },
  ])

  const [flyers, setFlyers] = useState([
    { id: "1", url: "https://walmart.com/flyer", store: "Walmart", status: "processed", logo: "🏪" },
    { id: "2", url: "https://target.com/weekly-ad", store: "Target", status: "processed", logo: "🎯" },
  ])

  const [matches, setMatches] = useState([
    {
      id: "1",
      item: "Milk",
      stores: [
        { store: "Walmart", price: 3.49, regularPrice: 4.29, savings: 0.8 },
        { store: "Target", price: 3.79, regularPrice: 4.49, savings: 0.7 },
      ],
    },
    {
      id: "2",
      item: "Bread",
      stores: [
        { store: "Walmart", price: 2.29, regularPrice: 2.99, savings: 0.7 },
        { store: "Target", price: 2.49, regularPrice: 2.99, savings: 0.5 },
      ],
    },
    {
      id: "3",
      item: "Eggs",
      stores: [
        { store: "Target", price: 4.99, regularPrice: 6.49, savings: 1.5 },
        { store: "Walmart", price: 5.29, regularPrice: 6.29, savings: 1.0 },
      ],
    },
    {
      id: "4",
      item: "Chicken Breast",
      stores: [
        { store: "Walmart", price: 8.99, regularPrice: 11.99, savings: 3.0 },
        { store: "Target", price: 9.49, regularPrice: 11.99, savings: 2.5 },
      ],
    },
    {
      id: "5",
      item: "Apples",
      stores: [
        { store: "Target", price: 4.99, regularPrice: 5.99, savings: 1.0 },
        { store: "Walmart", price: 5.29, regularPrice: 5.99, savings: 0.7 },
      ],
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TrendingDown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Smart Savings Tracker</h1>
                <p className="text-sm text-muted-foreground">AI-powered grocery savings</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-accent px-4 py-2">
              <span className="text-sm font-medium text-accent-foreground">Weekly Savings</span>
              <span className="text-2xl font-bold text-accent-foreground">$27.20</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Grocery List</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger value="flyers" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Flyers</span>
              <span className="sm:hidden">Flyers</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Savings</span>
              <span className="sm:hidden">Savings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <GroceryListManager items={groceryItems} setItems={setGroceryItems} />
          </TabsContent>

          <TabsContent value="flyers" className="mt-0">
            <FlyerProcessor flyers={flyers} setFlyers={setFlyers} />
          </TabsContent>

          <TabsContent value="savings" className="mt-0">
            <SavingsDashboard matches={matches} groceryItems={groceryItems} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
