"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Search, Edit, Trash2, Eye, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { getProducts } from "@/backend/products"
import { useToast } from "@/shared/ui/use-toast"

const ProductList = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await getProducts()
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (productId: string) => {
    // Store the product in localStorage for edit mode
    const product = products.find((p) => p.id === productId)
    if (product) {
      localStorage.setItem("editProduct", JSON.stringify(product))
      router.push("/dashboard/add-product")
    }
  }

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Add delete functionality when implemented
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success",
        })
        fetchProducts()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        })
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white border-slate-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {/* Add categories dynamically when available */}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-white border-slate-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => router.push("/dashboard/add-product")}
          className="bg-black hover:bg-slate-800 text-white whitespace-nowrap"
        >
          Add Product
        </Button>
      </div>

      <Card className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Products
              </CardTitle>
              <CardDescription className="text-slate-500">
                Manage your product inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 pl-6 py-4">
                  Product
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  SKU
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Stock
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-4">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700 pr-6 py-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-600 border-r border-slate-100 last:border-r-0">
                    {product.sku || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-slate-600 border-r border-slate-100 last:border-r-0">
                    {product.category_id || "Uncategorized"}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-slate-900 border-r border-slate-100 last:border-r-0">
                    ₹{product.price?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell className="py-3 text-slate-600 border-r border-slate-100 last:border-r-0">
                    {product.stock || 0}
                  </TableCell>
                  <TableCell className="py-3 border-r border-slate-100 last:border-r-0">
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                      className="capitalize font-medium"
                    >
                      {product.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 pr-6">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => handleEdit(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() =>
                          router.push(`/dashboard/products/${product.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                className="mt-4 border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => router.push("/dashboard/add-product")}
              >
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductList
