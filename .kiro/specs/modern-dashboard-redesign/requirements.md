# Modern Dashboard Redesign - Requirements

## Overview
Redesign the Kalamkari e-commerce admin dashboard to match a modern reference design while maintaining the existing brand identity. The focus is on creating a clean, scannable, and professional interface that prioritizes clarity and speed of comprehension.

## User Stories

### US-1: Dashboard Overview
**As an** admin user  
**I want** to see key business metrics at a glance in a clean, organized layout  
**So that** I can quickly understand business performance without cognitive overload

**Acceptance Criteria:**
- 1.1: Dashboard displays 4-5 KPI cards in a responsive grid (4 columns desktop, 2 tablet, 1 mobile)
- 1.2: KPI cards must use equal-width grid columns (content never affects card width)
- 1.3: Each KPI card shows: icon, label, primary value, percentage delta, and sparkline
- 1.4: KPI cards use elevated card design with 14px border radius and soft shadows
- 1.5: Cards maintain 20px gap between them
- 1.6: Layout uses app-shell structure with fixed sidebar (260px desktop, 220px tablet, drawer on mobile)
- 1.7: Top navigation bar is 72px height and sticky
- 1.8: Content area has max-width of 1440px with responsive padding (24px desktop, 20px tablet, 16px mobile)
- 1.9: Above-the-fold on 1440px screens contains ONLY: Topbar + KPI cards + ONE analytics row
- 1.10: No other content may appear before scroll (strict viewport constraint)

### US-2: KPI Card Design
**As an** admin user  
**I want** KPI cards that are visually consistent and information-dense  
**So that** I can scan metrics quickly and understand trends at a glance

**Acceptance Criteria:**
- 2.1: Each card has 20px internal padding
- 2.2: Maximum card height is 140px (strict constraint for viewport density)
- 2.3: Icon is 36px size with accent-light background and 10px border radius
- 2.4: Label uses 14px font size in gray-500 color
- 2.5: Primary value uses 24px font size with bold weight
- 2.6: Delta indicator displays as a badge with color-coded states (green=positive, red=negative, gray=neutral)
- 2.7: Sparkline chart appears at bottom of card with 40px height and 0.6 opacity
- 2.8: Cards support both solid and subtle-gradient backgrounds
- 2.9: Hover state provides subtle elevation increase
- 2.10: All 4-5 KPI cards must fit entirely within first viewport on 1440px screens without scroll

### US-3: Charts and Analytics
**As an** admin user  
**I want** charts that are soft, rounded, and non-intrusive  
**So that** I can understand data trends without visual overwhelm

**Acceptance Criteria:**
- 3.1: Sales source chart uses donut type with legend on right and center label
- 3.2: Chart card maximum height is 320px (strict constraint)
- 3.3: Chart colors use primary, secondary, warning, and info from design system
- 3.4: Statistics chart uses smooth line type with 2 lines maximum
- 3.5: Grid lines are subtle and non-distracting
- 3.6: Tooltips appear on hover with relevant data
- 3.7: Charts maintain consistent styling in both light and dark modes
- 3.8: Chart containers have same card styling as KPI cards
- 3.9: Charts must not exceed visual weight of KPI cards (use softer colors, lighter borders)

### US-4: Data Tables
**As an** admin user  
**I want** readable, well-spaced tables with clear status indicators  
**So that** I can quickly scan and understand order/product information

**Acceptance Criteria:**
- 4.1: Table rows have 56px height for comfortable scanning
- 4.2: Table headers are sticky during scroll
- 4.3: Cell padding is 12px for proper spacing
- 4.4: Status badges use color-coded system (delivered=success/green, shipped=info/blue, pending=warning/yellow)
- 4.5: Tables support hover states for row highlighting
- 4.6: Tables are fully responsive and adapt to mobile screens
- 4.7: Table containers have same card styling as other components

### US-5: Responsive Layout
**As an** admin user  
**I want** the dashboard to work flawlessly across all device sizes  
**So that** I can manage my business from any device

**Acceptance Criteria:**
- 5.1: Desktop (≥1024px): 4-column KPI grid, fixed sidebar visible
- 5.2: Tablet (768px-1023px): 2-column KPI grid, collapsible sidebar
- 5.3: Mobile (<768px): 1-column KPI grid, drawer sidebar overlay
- 5.4: All spacing scales appropriately per breakpoint
- 5.5: Touch targets are minimum 44px on mobile
- 5.6: Charts adapt to container width responsively
- 5.7: Tables scroll horizontally on mobile if needed

### US-6: Dark Mode Support
**As an** admin user  
**I want** consistent dark mode support with proper contrast  
**So that** I can work comfortably in low-light environments

**Acceptance Criteria:**
- 6.1: Dark mode uses gray-900 (#0F172A) for background
- 6.2: Cards use gray-800 for elevated surfaces
- 6.3: Primary text uses gray-100 for readability
- 6.4: Secondary text uses gray-400
- 6.5: Borders use gray-700
- 6.6: Charts use muted accent colors for better contrast
- 6.7: All interactive elements maintain WCAG AA contrast ratios
- 6.8: Mode toggle is easily accessible in top navigation

### US-7: Color System and Branding
**As an** admin user  
**I want** the dashboard to maintain Kalamkari brand identity  
**So that** the interface feels cohesive with the overall brand

**Acceptance Criteria:**
- 7.1: Primary color uses green (#16A34A) for main actions and positive states
- 7.2: Secondary color uses blue (#2563EB) for secondary actions
- 7.3: Gray scale (50-900) provides structural hierarchy
- 7.4: Accent colors only used for states: success (#22C55E), warning (#F59E0B), danger (#EF4444), info (#38BDF8)
- 7.5: No component visually overpowers another
- 7.6: Color usage is consistent across all components
- 7.7: Decorative elements are minimal and purposeful

### US-8: Typography and Spacing
**As an** admin user  
**I want** consistent typography and spacing throughout the dashboard  
**So that** the interface feels cohesive and professional

**Acceptance Criteria:**
- 8.1: Font family is Inter (with system-ui fallback)
- 8.2: Font sizes follow scale: xs(12px), sm(14px), base(16px), lg(18px), xl(20px), 2xl(24px), 3xl(30px)
- 8.3: Font weights: regular(400), medium(500), semibold(600), bold(700)
- 8.4: Section vertical spacing: 32px (desktop), 24px (tablet), 20px (mobile)
- 8.5: Header-to-content spacing below topbar: 24px
- 8.6: Sidebar-to-content horizontal spacing: 24px
- 8.7: Spacing is tight but breathable with no large empty areas
- 8.8: All components align to shared grid system
- 8.9: Consistent use of padding and margins across components
- 8.10: Line heights provide comfortable reading
- 8.11: Empty space must communicate grouping, not decoration

### US-9: Performance and Loading States
**As an** admin user  
**I want** the dashboard to load quickly and show loading states  
**So that** I understand when data is being fetched

**Acceptance Criteria:**
- 9.1: Initial dashboard loads within 2 seconds on average connection
- 9.2: KPI cards show skeleton loaders while data fetches
- 9.3: Charts show loading spinners during data fetch
- 9.4: Tables show skeleton rows during data fetch
- 9.5: Error states are clearly communicated with retry options
- 9.6: Optimistic updates provide immediate feedback for user actions

### US-10: Sidebar Navigation
**As an** admin user  
**I want** a clean, organized sidebar navigation  
**So that** I can quickly access different sections of the admin panel

**Acceptance Criteria:**
- 10.1: Sidebar width is 260px on desktop, 220px on tablet
- 10.2: Navigation items have clear icons and labels
- 10.3: Active state is clearly indicated with background color
- 10.4: Hover states provide visual feedback
- 10.5: Sidebar is collapsible on tablet and drawer on mobile
- 10.6: Logo/brand appears at top of sidebar
- 10.7: User profile/settings accessible from sidebar or top bar

## Technical Constraints

- Must use existing Next.js 14+ app router structure
- Must integrate with existing Supabase backend
- Must use Tailwind CSS for styling
- Must maintain existing authentication flow
- Must support existing data fetching patterns
- Should use shadcn/ui components where applicable
- Must be accessible (WCAG AA minimum)

## Density & Visual Hierarchy Rules (Critical)

These rules are non-negotiable and must be strictly enforced:

1. **Viewport Density**: All KPI cards must fit entirely within first viewport on 1440px screens without scroll
2. **Component Height Constraints**:
   - KPI card max height: 140px
   - Chart card max height: 320px
3. **Vertical Spacing**:
   - Section spacing: 32px (desktop), 24px (tablet), 20px (mobile)
   - Header-to-content spacing below topbar: 24px
4. **Horizontal Spacing**:
   - Sidebar-to-content spacing: 24px
5. **Visual Weight Hierarchy**:
   - No component may exceed visual weight of KPI cards
   - KPI cards are the primary focus and must be most prominent
   - Charts, tables, and other components must be visually subordinate
6. **Purposeful Space**:
   - Empty space must communicate grouping, not decoration
   - No large empty areas without purpose
   - Spacing should guide the eye and create clear content relationships

## STRICT IMPLEMENTATION CONTRACT

**This is a binding contract for implementation. Violation of any rule invalidates the implementation.**

### Rule 1: Spacing Constraint
**No component may introduce spacing not defined in this document.**
- Only use spacing values explicitly defined in the design system
- Permitted spacing: 16px, 20px, 24px, 32px (responsive as specified)
- Any other spacing value is forbidden
- Margin and padding must follow defined specifications exactly

### Rule 2: Height Constraint
**No component may exceed defined height limits.**
- KPI cards: 140px maximum (hard limit)
- Chart cards: 320px maximum (hard limit)
- Exceeding these limits by even 1px invalidates the implementation
- Height includes padding, border, and all internal content

### Rule 3: Visual Language Consistency
**KPI cards define the visual language for all other cards.**
- All card components must inherit styling from KPI card design
- Border radius: 14px (from KPI cards)
- Shadow style: soft-elevated (from KPI cards)
- Padding: 20px (from KPI cards)
- Background treatment: solid or subtle-gradient (from KPI cards)
- No card may deviate from this established pattern

### Rule 4: Default Design Decisions
**If a design decision is unclear, default to:**
- **Smaller**: Choose the more compact option
- **Flatter**: Reduce elevation and visual weight
- **Denser**: Minimize whitespace while maintaining readability
- When in doubt, prioritize information density over visual comfort

### Rule 5: Viewport Validation (Critical)
**If KPI cards do not fit in first viewport → implementation is invalid.**
- Test on 1440px width screen at standard browser chrome height
- All 4-5 KPI cards must be fully visible without any scroll
- This is the primary validation criterion
- Failed viewport test = complete implementation failure

### Rule 6: Above-the-Fold Content (Critical)
**Above-the-fold on 1440px screens contains ONLY:**
1. Topbar (72px)
2. KPI cards row (140px max + spacing)
3. ONE analytics row (charts/stats - 320px max)

**Nothing else may appear before scroll.**
- No additional sections, cards, or content blocks
- No welcome messages, banners, or promotional content
- No extra spacing or padding beyond defined values
- Viewport budget is strictly allocated to these three elements only

### Rule 7: Grid Layout Constraint
**KPI cards must use equal-width grid columns.**
- All KPI cards have identical width regardless of content
- Content must never affect card width
- Use CSS Grid with equal fr units (e.g., `grid-template-columns: repeat(4, 1fr)`)
- Long numbers or text must truncate/wrap within card boundaries
- Card width is determined by grid, not by content

### Validation Checklist

Before considering implementation complete, verify:
- [ ] All KPI cards visible in first viewport on 1440px screen (no scroll)
- [ ] Above-the-fold contains ONLY: Topbar + KPI cards + ONE analytics row
- [ ] KPI cards use equal-width grid columns (content doesn't affect width)
- [ ] KPI card height ≤ 140px
- [ ] Chart card height ≤ 320px
- [ ] Only defined spacing values used (16, 20, 24, 32px)
- [ ] All cards follow KPI card visual language
- [ ] No component exceeds KPI card visual weight
- [ ] Empty space serves grouping purpose only
- [ ] Design defaults to smaller/flatter/denser when unclear

**Implementation that fails any validation item must be rejected and revised.**

## Design System Reference

The implementation must strictly follow the provided design system JSON specification for:
- Layout dimensions and breakpoints
- Color palette (light and dark modes)
- Typography scale and weights
- Component specifications (KPI cards, charts, tables)
- Spacing and grid system
- Responsive behavior

## Success Metrics

- Dashboard loads in under 2 seconds
- All KPI cards render with correct data
- Charts display accurate business data
- Tables support sorting and filtering
- Responsive layout works on all target devices
- Dark mode toggle works without flicker
- No accessibility violations in automated testing
- User can complete common tasks 30% faster than current design

## Out of Scope

- Backend API changes
- Authentication system modifications
- New feature additions beyond UI redesign
- Data model changes
- Third-party integrations
