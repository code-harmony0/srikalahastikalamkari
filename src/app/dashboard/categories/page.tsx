"use client";

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/app/dashboard/ui/button"
import { Input } from "@/app/dashboard/ui/input"
import { Label } from "@/app/dashboard/ui/label"
import { Textarea } from "@/app/dashboard/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/dashboard/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/dashboard/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react"
import {
  getCategories,
  getSubCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  unlinkProductsFromCategory,
  unlinkProductsFromSubCategory,
} from "@/services/categories"
import { uploadImage } from "@/services/products"
import imageCompression from "browser-image-compression"
import { OptimizedImage } from "@/components/shared/OptimizedImage"

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [hoveredImage, setHoveredImage] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Category dialog state
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({ name: "" })

  // SubCategory dialog state
  const [subCategoryDialog, setSubCategoryDialog] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null)
  const defaultSubCategoryForm = { name: "", category_id: "", image_url: "" }
  const [subCategoryForm, setSubCategoryForm] = useState(defaultSubCategoryForm)
  const [subCategoryImageFile, setSubCategoryImageFile] = useState<File | null>(
    null
  )
  const [subCategoryImagePreview, setSubCategoryImagePreview] = useState<
    string | null
  >(null)
  const [subCategoryImageCompressing, setSubCategoryImageCompressing] =
    useState(false)

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "category" | "subcategory"
    id: string
  } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: cats } = await getCategories()
    const { data: subCats } = await getSubCategories()
    if (cats) setCategories(cats)
    if (subCats) setSubCategories(subCats)
  }



  // Category CRUD
  const openCategoryDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({ name: category.name })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: "" })
    }
    setCategoryDialog(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.success("Validation Error", { description: "Category name is required" })
      return
    }

    setLoading(true)
    const payload = {
      name: categoryForm.name.trim(),
    }

    const { error } = editingCategory
      ? await updateCategory(editingCategory.id, payload)
      : await createCategory(payload)

    setLoading(false)

    if (error) {
      toast.error("Error", { description: error.message })
    } else {
      toast.success("Success", {
        description: `Category ${
          editingCategory ? "updated" : "created"
        } successfully`
      })
      setCategoryDialog(false)
      fetchData()
    }
  }

  const confirmDeleteCategory = (id: string) => {
    setItemToDelete({ type: "category", id })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSubCategory = (id: string) => {
    setItemToDelete({ type: "subcategory", id })
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "category") {
      await handleDeleteCategory(itemToDelete.id)
    } else {
      await handleDeleteSubCategory(itemToDelete.id)
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleDeleteCategory = async (id: string) => {
    console.log("Deleting category:", id)
    setLoading(true)

    // 1. Unlink products from this category (and its subcategories)
    console.log("Unlinking products from category...")
    const { error: unlinkError } = await unlinkProductsFromCategory(id)
    if (unlinkError) {
      console.error("Unlink failed:", unlinkError)
      setLoading(false)
      toast.success("Error", { description: "Failed to unlink products: " + unlinkError.message })
      return
    }

    // 2. Find all subcategories for this category
    const relatedSubCats = subCategories.filter((sc) => String(sc.category_id) === String(id))
    console.log("Found related subcategories:", relatedSubCats.length)

    // 3. Delete all related subcategories first
    if (relatedSubCats.length > 0) {
      const deletePromises = relatedSubCats.map((sc) =>
        deleteSubCategory(sc.id)
      )
      const results = await Promise.all(deletePromises)

      // Check for errors in subcategory deletion
      const subCatError = results.find((r) => r.error)
      if (subCatError) {
        console.error("Subcategory delete failed:", subCatError)
        setLoading(false)
        toast.success("Error", { description: "Failed to delete subcategories: " + subCatError.error.message })
        return
      }
    }

    // 4. Now delete the category
    console.log("Deleting category record...")
    const { error } = await deleteCategory(id)
    setLoading(false)

    if (error) {
      console.error("Category delete failed:", error)
      toast.success("Error", { description: error.message })
    } else {
      console.log("Category deleted successfully")
      toast.success("Success", { description: "Category and subcategories deleted successfully" })
      fetchData()
    }
  }

  // SubCategory CRUD
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const resetSubCategoryDialogState = () => {
    setEditingSubCategory(null)
    setSubCategoryForm(defaultSubCategoryForm)
    setSubCategoryImageFile(null)
    setSubCategoryImagePreview(null)
    setSubCategoryDialog(false)
  }

  const handleSubCategoryDialogToggle = (open: boolean) => {
    if (!open) {
      resetSubCategoryDialogState()
      return
    }
    setSubCategoryDialog(true)
  }

  const openSubCategoryDialog = (subCategory?: any) => {
    if (subCategory) {
      setEditingSubCategory(subCategory)
      setSubCategoryForm({
        name: subCategory.name ?? "",
        category_id: subCategory.category_id?.toString() ?? "",
        image_url: subCategory.image_url ?? "",
      })
      setSubCategoryImageFile(null)
      setSubCategoryImagePreview(subCategory.image_url ?? null)
    } else {
      setEditingSubCategory(null)
      setSubCategoryForm(defaultSubCategoryForm)
      setSubCategoryImageFile(null)
      setSubCategoryImagePreview(null)
    }
    setSubCategoryDialog(true)
  }

  const handleSubCategoryImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSubCategoryImageCompressing(true)
    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.92,
      }
      const compressed = await imageCompression(file, options)
      setSubCategoryImageFile(compressed)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSubCategoryImagePreview(reader.result as string)
      }
      reader.readAsDataURL(compressed)
    } catch (error) {
      console.error("Failed to process subcategory image:", error)
      toast.success("Image error", { description: "Unable to process the selected image." })
    } finally {
      setSubCategoryImageCompressing(false)
    }
  }

  const handleClearSubCategoryImage = () => {
    setSubCategoryImageFile(null)
    setSubCategoryImagePreview(null)
    setSubCategoryForm((prev) => ({ ...prev, image_url: "" }))
  }

  const handleSubCategoryImageBoxClick = () => {
    fileInputRef.current?.click()
  }

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name.trim() || !subCategoryForm.category_id) {
      toast.success("Validation Error", { description: "Name and category are required" })
      return
    }

    setLoading(true)
    let imageUrl = subCategoryForm.image_url || null

    if (subCategoryImageFile) {
      const { url, error } = await uploadImage(subCategoryImageFile)
      if (error || !url) {
        setLoading(false)
        toast.success("Upload failed", { description: error?.message || "Unable to upload image" })
        return
      }
      imageUrl = url
    }

    const payload = {
      name: subCategoryForm.name.trim(),
      category_id: subCategoryForm.category_id, // UUID string, not parseInt
      image_url: imageUrl,
    }

    const { error } = editingSubCategory
      ? await updateSubCategory(editingSubCategory.id, payload)
      : await createSubCategory(payload)

    setLoading(false)

    if (error) {
      toast.error("Error", { description: error.message })
    } else {
      toast.success("Success", {
        description: `Subcategory ${
          editingSubCategory ? "updated" : "created"
        } successfully`
      })
      resetSubCategoryDialogState()
      fetchData()
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    console.log("Deleting subcategory:", id)
    setLoading(true)

    // 1. Unlink products from this subcategory
    console.log("Unlinking products from subcategory...")
    const { error: unlinkError } = await unlinkProductsFromSubCategory(id)
    if (unlinkError) {
      console.error("Unlink failed:", unlinkError)
      setLoading(false)
      toast.success("Error", { description: "Failed to unlink products: " + unlinkError.message })
      return
    }

    // 2. Delete the subcategory
    console.log("Deleting subcategory record...")
    const { error } = await deleteSubCategory(id)
    setLoading(false)

    if (error) {
      console.error("Subcategory delete failed:", error)
      toast.success("Error", { description: error.message })
    } else {
      console.log("Subcategory deleted successfully")
      toast.success("Success", { description: "Subcategory deleted successfully" })
      fetchData()
    }
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => String(c.id) === String(categoryId))?.name || "Unknown"
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your product categories and subcategories
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {/* Categories Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Categories</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Main product categories
                </p>
              </div>
              <Button
                onClick={() => openCategoryDialog()}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
          <div className="p-6 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="w-[100px] text-slate-700 font-semibold text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-12 text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Plus className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm">No categories found</p>
                        <p className="text-xs text-slate-400">Click "Seed Data" to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-slate-50/50 border-slate-100"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCategoryDialog(cat)}
                            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteCategory(cat.id)}
                            className="h-8 w-8 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* SubCategories Card */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Subcategories
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Product subcategories
                </p>
              </div>
              <Button
                onClick={() => openSubCategoryDialog()}
                disabled={categories.length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 disabled:opacity-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50 border-slate-100">
                  <TableHead className="w-[80px] text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Image
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="w-[100px] text-slate-700 font-semibold text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                       <div className="flex flex-col items-center gap-3">
                         <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                           <Plus className="h-5 w-5 text-slate-400" />
                         </div>
                         <p className="text-sm">No subcategories found</p>
                         <p className="text-xs text-slate-400">Add a subcategory to organize products</p>
                       </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  subCategories.map((subCat) => (
                    <TableRow
                      key={subCat.id}
                      className="hover:bg-slate-50/50 border-slate-100"
                    >
                      <TableCell>
                        <div 
                          className="relative h-16 w-16 rounded-md bg-slate-100 overflow-hidden border border-slate-200 cursor-zoom-in"
                          onMouseEnter={() => subCat.image_url && setHoveredImage({ url: subCat.image_url, name: subCat.name })}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                           {subCat.image_url ? (
                             <OptimizedImage
                               src={subCat.image_url}
                               alt={subCat.name}
                               fill
                               className="object-cover"
                               imageType="thumbnail"
                               sizes="64px"
                               placeholder="empty"
                             />
                           ) : (
                             <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300">
                               <Upload className="h-4 w-4" />
                             </div>
                           )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {subCat.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {getCategoryName(subCat.category_id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openSubCategoryDialog(subCat)}
                            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteSubCategory(subCat.id)}
                            className="h-8 w-8 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0 !bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingCategory
                ? "Update the category details below."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cat-name" className="text-slate-700 font-medium">
                Name *
              </Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="e.g., Sarees"
                className="mt-2 h-11 rounded-xl border-slate-300 focus-visible:border-slate-900 focus-visible:ring-0 text-slate-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialog(false)}
              className="rounded-xl border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Dialog */}
      <Dialog
        open={subCategoryDialog}
        onOpenChange={handleSubCategoryDialogToggle}
      >
        <DialogContent className="rounded-2xl shadow-2xl border-0 !bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingSubCategory
                ? "Update the subcategory details below."
                : "Create a new subcategory."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="subcat-name"
                className="text-slate-700 font-medium"
              >
                Name *
              </Label>
              <Input
                id="subcat-name"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm({
                    ...subCategoryForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Silk Sarees"
                className="mt-2 h-11 rounded-xl border-slate-300 focus-visible:border-slate-900 focus-visible:ring-0 text-slate-900"
              />
            </div>
            <div>
              <Label
                htmlFor="subcat-category"
                className="text-slate-700 font-medium"
              >
                Category *
              </Label>
              <Select
                value={subCategoryForm.category_id}
                onValueChange={(value) =>
                  setSubCategoryForm({
                    ...subCategoryForm,
                    category_id: value,
                  })
                }
              >
                <SelectTrigger className="mt-2 h-11 rounded-xl border-slate-300 focus:border-slate-900 focus:ring-0 text-slate-900">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-slate-900">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">
                Subcategory Image
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Used on the storefront subcategory tiles. Recommended size
                600x600px.
              </p>
              <div
                className="mt-3 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50/40 hover:border-slate-400 transition cursor-pointer relative"
                onClick={handleSubCategoryImageBoxClick}
              >
                {subCategoryImagePreview ? (
                  subCategoryImagePreview.startsWith("data:") ||
                  subCategoryImagePreview.startsWith("blob:") ? (
                    <img
                      src={subCategoryImagePreview}
                      alt="Subcategory preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={subCategoryImagePreview}
                        alt="Subcategory preview"
                        fill
                        className="object-cover"
                        imageType="category"
                        sizes="320px"
                        placeholder="empty"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">
                        Click to upload
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                )}
                {subCategoryImageCompressing && (
                  <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleSubCategoryImageChange}
              />
              {(subCategoryImagePreview || subCategoryForm.image_url) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-slate-600 hover:text-slate-900"
                  onClick={handleClearSubCategoryImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove image
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetSubCategoryDialogState}
              className="rounded-xl border-slate-300 text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubCategory}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSubCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {itemToDelete?.type === "category"
                ? "This will permanently delete the category and all its subcategories. Products will be unlinked but not deleted."
                : "This will permanently delete the subcategory. Products will be unlinked but not deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-300 text-slate-900 hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Global Hover Overlay (Fixed Position to escape Table overflow) */}
      {hoveredImage && (
        <div 
          className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
            <div className="w-80 h-80 rounded-xl overflow-hidden relative bg-slate-100">
              <OptimizedImage
                src={hoveredImage.url}
                alt={hoveredImage.name}
                fill
                className="object-cover"
                imageType="category"
                sizes="320px"
                placeholder="empty"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3 text-white text-sm font-medium text-center backdrop-blur-md">
                {hoveredImage.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
