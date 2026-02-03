# Dashboard Theme Guide

## Color Scheme - Black & White Theme

### Primary Colors
- **Background**: `bg-[#f8fafc]` (light gray background)
- **Cards**: `bg-white` with `border-slate-100`
- **Text Primary**: `text-slate-900` (black)
- **Text Secondary**: `text-slate-500` / `text-slate-600`
- **Text Muted**: `text-slate-400`

### Borders
- **Default**: `border-slate-300`
- **Light**: `border-slate-100` / `border-slate-200`
- **Focus**: `border-slate-900` (black)
- **Hover**: `border-slate-400`

### Buttons
- **Primary**: `bg-slate-900 hover:bg-slate-800 text-white`
- **Secondary**: `bg-slate-100 hover:bg-slate-200 text-slate-900`
- **Outline**: `border-slate-300 text-slate-900 hover:bg-slate-100`
- **Ghost**: `hover:bg-slate-100 text-slate-600`
- **Destructive**: `bg-red-600 hover:bg-red-700 text-white`

### Form Elements

#### Input Fields
```tsx
<Input
  className="border-slate-300 focus-visible:border-slate-900 focus-visible:ring-0 text-slate-900"
/>
```

#### Select Dropdowns
```tsx
<Select>
  <SelectTrigger className="border-slate-300 focus:border-slate-900 focus:ring-0 text-slate-900">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent className="bg-white border-slate-300">
    <SelectItem value="1" className="text-slate-900">Option 1</SelectItem>
  </SelectContent>
</Select>
```

#### Textarea
```tsx
<Textarea
  className="border-slate-300 focus-visible:border-slate-900 focus-visible:ring-0 text-slate-900"
/>
```

#### Checkbox
```tsx
<Checkbox
  className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
/>
```

#### Radio
```tsx
<RadioGroup>
  <RadioGroupItem
    className="border-slate-300 text-slate-900"
  />
</RadioGroup>
```

### Dialogs & Modals
```tsx
<Dialog>
  <DialogContent className="rounded-2xl shadow-2xl border-0 bg-white">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-slate-900">
        Title
      </DialogTitle>
      <DialogDescription className="text-slate-500">
        Description
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">
        Cancel
      </Button>
      <Button className="bg-slate-900 hover:bg-slate-800 text-white">
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tables
```tsx
<Table>
  <TableHeader className="bg-slate-50/50">
    <TableRow className="hover:bg-slate-50/50 border-slate-100">
      <TableHead className="text-slate-700 font-semibold">Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-slate-50/50 border-slate-100">
      <TableCell className="text-slate-900">Content</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Cards
```tsx
<Card className="bg-white rounded-2xl shadow-sm border border-slate-100">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-bold text-slate-900">Title</CardTitle>
    <CardDescription className="text-sm text-slate-500">Description</CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Alert Dialogs
```tsx
<AlertDialog>
  <AlertDialogContent className="rounded-2xl shadow-2xl border-0 bg-white">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-xl font-bold text-slate-900">
        Are you sure?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-slate-500">
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className="border-slate-300 text-slate-900 hover:bg-slate-100">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Badges
```tsx
<Badge className="bg-slate-900 text-white">Default</Badge>
<Badge variant="outline" className="border-slate-300 text-slate-900">Outline</Badge>
<Badge variant="secondary" className="bg-slate-100 text-slate-900">Secondary</Badge>
```

### Toasts
```tsx
toast({
  title: "Success",
  description: "Action completed successfully",
  duration: 5000,
})

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
  duration: 5000,
})
```

## Important Rules

### ❌ NEVER Use These Colors
- Golden/yellow borders or focus rings
- Blue primary colors (unless for links)
- Colored backgrounds (except red for destructive actions)

### ✅ ALWAYS Use These
- `focus-visible:ring-0` to remove colored focus rings
- `focus-visible:border-slate-900` for black focus borders
- `text-slate-900` for primary text
- `border-slate-300` for default borders
- `bg-white` for cards and dialogs

### Focus States
All form elements MUST have:
```tsx
className="focus-visible:border-slate-900 focus-visible:ring-0"
```

This ensures:
- No golden/colored focus ring
- Clean black border on focus
- Consistent with black & white theme

## Component Checklist

When adding/updating dashboard components:

- [ ] All inputs have black focus borders (not golden)
- [ ] All selects use shadcn Select component
- [ ] All buttons follow the button color scheme
- [ ] All text is slate-900 (black) or slate-500/600 (gray)
- [ ] All borders are slate-300 or slate-100
- [ ] All cards have white background
- [ ] All dialogs have rounded-2xl and white background
- [ ] No colored focus rings anywhere
- [ ] Cancel buttons are outline style with slate colors
- [ ] Primary actions are slate-900 background
- [ ] Destructive actions are red-600 background

## Examples

### Good ✅
```tsx
<Input className="border-slate-300 focus-visible:border-slate-900 focus-visible:ring-0 text-slate-900" />
<Button className="bg-slate-900 hover:bg-slate-800 text-white">Save</Button>
<Button variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">Cancel</Button>
```

### Bad ❌
```tsx
<Input className="border-slate-200" /> {/* Will show golden focus ring */}
<Button className="bg-blue-600">Save</Button> {/* Wrong color */}
<Button variant="outline">Cancel</Button> {/* Missing slate colors */}
```
