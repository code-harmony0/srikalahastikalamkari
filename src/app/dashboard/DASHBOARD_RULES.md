# Dashboard UI/UX Rules & Patterns

## CRITICAL: Follow These Rules for ALL Dashboard Development

This document defines the mandatory patterns for the admin dashboard. **Read before making ANY changes.**

---

## 1. UUID Handling (CRITICAL)

**NEVER use `parseInt()` on IDs** - All Supabase IDs are UUIDs (strings).

```typescript
// WRONG - Will break!
const filtered = items.filter(item => item.category_id === parseInt(formData.category));

// CORRECT - Compare as strings
const filtered = items.filter(item => String(item.category_id) === String(formData.category));
```

### ID Type Definitions
```typescript
// Use string | number for flexibility with UUIDs
type EntityId = string | number;

// Function signatures
const deleteItem = async (id: string | number) => { ... }
```

---

## 2. Collapsible Sections Pattern

Use collapsible sections to organize complex forms and detail pages.

### FormSection Component (for forms)
```tsx
const FormSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  badge
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <span className="text-base font-semibold text-slate-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-6 pt-2 border-t border-slate-100 bg-slate-50/30">
          {children}
        </div>
      )}
    </div>
  );
};
```

### DetailSection Component (for detail pages)
```tsx
const DetailSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <span className="text-base font-semibold text-slate-900">{title}</span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};
```

---

## 3. Table Styling

### Table Headers
```tsx
<TableHeader className="bg-slate-50/80">
  <TableRow className="hover:bg-transparent border-b border-slate-200">
    <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4 px-6">
      Column Name
    </TableHead>
  </TableRow>
</TableHeader>
```

### Table Rows
```tsx
<TableRow className="group hover:bg-slate-50/50 border-b border-slate-100 last:border-b-0 transition-colors">
  <TableCell className="py-4 px-6">...</TableCell>
</TableRow>
```

### Action Buttons (ALWAYS VISIBLE)
```tsx
// WRONG - Don't hide actions on hover
<div className="opacity-0 group-hover:opacity-100">...</div>

// CORRECT - Actions always visible
<div className="flex items-center justify-end gap-1">
  <Button
    size="icon"
    variant="ghost"
    className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
  >
    <Edit className="h-4 w-4" />
  </Button>
  <Button
    size="icon"
    variant="ghost"
    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

---

## 4. Card Styling

### Standard Card
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
  {/* Card content */}
</div>
```

### Card with Header
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
  <div className="p-6 border-b border-slate-100">
    <h3 className="text-lg font-bold text-slate-900">Title</h3>
    <p className="text-sm text-slate-500 mt-1">Description</p>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Equal Height Cards in Grid
```tsx
<div className="grid gap-6 md:grid-cols-2 items-stretch">
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
    {/* Card 1 */}
  </div>
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
    {/* Card 2 */}
  </div>
</div>
```

---

## 5. Form Elements

### Input Fields
```tsx
<Input
  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-900"
  placeholder="..."
/>
```

### Select Dropdowns
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="h-11 rounded-xl border-slate-200">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option">Option</SelectItem>
  </SelectContent>
</Select>
```

### Labels
```tsx
<Label className="text-slate-700 font-medium">
  Field Name <span className="text-red-500">*</span>
</Label>
```

---

## 6. Button Styling

### Primary Button
```tsx
<Button className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-4 rounded-xl shadow-md">
  Action
</Button>
```

### Secondary/Outline Button
```tsx
<Button variant="outline" className="h-10 border-slate-200 hover:bg-slate-50 rounded-xl">
  Secondary
</Button>
```

### Ghost Button
```tsx
<Button variant="ghost" className="h-9 hover:bg-slate-100 text-slate-600">
  Ghost
</Button>
```

### Destructive Button
```tsx
<Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-xl shadow-md">
  Delete
</Button>
```

---

## 7. Empty States

### Table Empty State
```tsx
<TableRow>
  <TableCell colSpan={columns} className="text-center py-12 text-slate-400">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
        <IconComponent className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm">No items found</p>
      <p className="text-xs text-slate-400">Helpful hint here</p>
    </div>
  </TableCell>
</TableRow>
```

---

## 8. Page Layout

### Standard Page Structure
```tsx
<div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans space-y-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
        Page Title
      </h1>
      <p className="text-slate-500 text-sm mt-1">Page description</p>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Stats Cards (optional) */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* KPI cards */}
  </div>

  {/* Main Content */}
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
    {/* Content */}
  </div>
</div>
```

---

## 9. Color Palette

### Primary Colors (Slate-based)
- Background: `bg-[#f8fafc]` or `bg-slate-50`
- Cards: `bg-white`
- Borders: `border-slate-100` or `border-slate-200`
- Text Primary: `text-slate-900`
- Text Secondary: `text-slate-500`
- Text Muted: `text-slate-400`

### Status Colors
- Success: `bg-emerald-50 text-emerald-700 border-emerald-200`
- Warning: `bg-amber-50 text-amber-700 border-amber-200`
- Danger: `bg-red-50 text-red-700 border-red-200`
- Info: `bg-blue-50 text-blue-700 border-blue-200`

### Stock Indicators
- Healthy (>5): `bg-emerald-500`
- Low (<5): `bg-amber-500`

---

## 10. Spacing & Sizing

### Consistent Gaps
- Card grid: `gap-6`
- Form fields: `space-y-4`
- Section spacing: `space-y-6`

### Border Radius
- Cards: `rounded-2xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Small elements: `rounded-lg`
- Badges: `rounded-full`

### Heights
- Standard button: `h-10`
- Compact button: `h-9`
- Icon button: `h-8 w-8`
- Input fields: `h-11`

---

## 11. Dialogs & Modals

### Alert Dialog
```tsx
<AlertDialog>
  <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-xl font-bold text-slate-900">
        Title
      </AlertDialogTitle>
      <AlertDialogDescription className="text-slate-500">
        Description text
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className="rounded-xl border-slate-200">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
        Confirm
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 12. Data Passing Between Pages

### Use sessionStorage for Edit Mode
```typescript
// Setting data before navigation
const handleEdit = (item: any) => {
  sessionStorage.setItem(`item_${item.id}`, JSON.stringify(item));
  router.push(`/dashboard/edit?id=${item.id}`);
};

// Retrieving data on edit page
useEffect(() => {
  const stored = sessionStorage.getItem(`item_${id}`);
  if (stored) {
    setItem(JSON.parse(stored));
  }
}, [id]);
```

---

## 13. Loading States

### Page Loading
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <Package className="h-12 w-12 animate-bounce text-slate-400" />
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
```

### Button Loading
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

---

## 14. Toast Notifications

### Success Toast
```tsx
toast({
  title: "Success",
  description: "Action completed successfully",
  className: "bg-green-50 border-green-200",
});
```

### Error Toast
```tsx
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
});
```

---

## Quick Reference Checklist

Before submitting any dashboard code, verify:

- [ ] No `parseInt()` on UUIDs - use string comparison
- [ ] Table actions are ALWAYS visible (no hover-only)
- [ ] Cards use `rounded-2xl` and `border-slate-100`
- [ ] Buttons use `rounded-xl`
- [ ] Inputs use `h-11 rounded-xl`
- [ ] Page background is `bg-[#f8fafc]`
- [ ] Empty states have centered icon + helpful text
- [ ] Loading states show spinner animation
- [ ] Forms use collapsible sections when >3 fields
- [ ] Detail pages use collapsible DetailSection
- [ ] Uses sessionStorage for edit mode data passing
