"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  brand: string
  checked: boolean
}

interface GroceryListManagerProps {
  items: GroceryItem[]
  setItems: (items: GroceryItem[]) => void
}

const categories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Beverages", "Snacks"]

export function GroceryListManager({ items, setItems }: GroceryListManagerProps) {
  const [newItem, setNewItem] = useState({ name: "", category: "Produce", quantity: 1, brand: "Any" })

  const addItem = () => {
    if (newItem.name.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          ...newItem,
          checked: false,
        },
      ])
      setNewItem({ name: "", category: "Produce", quantity: 1, brand: "Any" })
    }
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add Item</CardTitle>
          <CardDescription>Add items to your grocery list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g., Organic Bananas"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Any"
                value={newItem.brand}
                onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={addItem} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add to List
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Your Grocery List</CardTitle>
          <CardDescription>
            {items.length} items • {items.filter((i) => i.checked).length} checked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your grocery list is empty</p>
                <p className="text-sm text-muted-foreground">Add items to get started</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 rounded-full border-2 ${
                      item.checked ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.checked && <Check className="h-4 w-4 text-primary-foreground" />}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {item.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>{item.brand}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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

function ShoppingCart({ className }: { className?: string }) {
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
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
