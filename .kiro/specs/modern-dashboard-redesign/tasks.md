# Implementation Plan: Modern Dashboard Redesign

## Overview

This implementation plan breaks down the modern dashboard redesign into discrete, sequential coding tasks. The approach follows a bottom-up strategy: starting with foundational design system tokens, building up to base components, then complex components, assembling the layout structure, and finally integrating everything into the dashboard page.

Each task builds on previous work and includes validation checkpoints to ensure compliance with the strict implementation contract. The plan prioritizes information density, viewport constraints, and visual hierarchy as defined in the requirements.

## Critical Implementation Contract

Before starting implementation, review these non-negotiable constraints:

1. **Viewport Density**: All KPI cards must fit in first viewport on 1440px screens (no scroll)
2. **Height Limits**: KPI cards ≤140px, Chart cards ≤320px
3. **Spacing Values**: Only use 16px, 20px, 24px, 32px (responsive as specified)
4. **Visual Language**: All cards inherit styling from KPI card design
5. **Equal-Width Grid**: KPI cards use equal-width columns (content never affects width)
6. **Above-the-Fold**: Only topbar + KPI cards + ONE analytics row before scroll

## Tasks

### Phase 1: Design System Foundation

- [ ] 1. Set up design system tokens and utilities
  - Create `src/lib/design-system/tokens.ts` with color palette, typography scale, spacing values, shadows, and breakpoints
  - Create `src/lib/design-system/utils.ts` with utility functions for responsive values and theme-aware colors
  - Export design system constants matching the JSON specification in design document
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

- [ ]* 1.1 Write property test for design system tokens
  - **Property 27: Brand Color System**
  - **Property 28: Gray Scale Hierarchy**
  - **Property 29: Typography System**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3**

- [ ] 2. Create theme provider with dark mode support
  - Implement `src/components/providers/ThemeProvider.tsx` using next-themes
  - Add theme toggle component in `src/components/ui/ThemeToggle.tsx`
  - Configure theme colors for light and dark modes
  - Ensure WCAG AA contrast compliance
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

- [ ]* 2.1 Write property test for dark mode color system
  - **Property 24: Dark Mode Color System**
  - **Property 26: WCAG AA Contrast Compliance**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.7**

### Phase 2: Base Card Component

- [ ] 3. Implement base Card component with KPI styling
  - Create `src/components/dashboard/Card.tsx` with base card styling
  - Implement 14px border radius, 20px padding, soft elevation shadow
  - Support solid and gradient backgrounds
  - Implement hover state with elevation increase
  - Ensure max-width behavior for grid layouts
  - _Requirements: 1.4, 2.1, 2.8, 2.9, 3.8_

- [ ]* 3.1 Write property test for card styling inheritance
  - **Property 16: Card Styling Inheritance**
  - **Property 11: Card Hover Elevation**
  - **Validates: Requirements 1.4, 2.1, 2.8, 2.9, 3.8**

- [ ]* 3.2 Write unit tests for Card component
  - Test solid background rendering
  - Test gradient background rendering
  - Test hover state elevation change
  - Test padding and border radius values
  - _Requirements: 1.4, 2.1, 2.8, 2.9_

### Phase 3: KPI Card Component

- [ ] 4. Implement KPI Card component structure
  - Create `src/components/dashboard/KPICard.tsx` with TypeScript interface
  - Implement icon container (36px with 10px border radius and accent background)
  - Implement label section (14px, gray-500, uppercase, semibold)
  - Implement primary value section (24px, bold)
  - Implement delta badge with color-coded states (green/red/gray)
  - Ensure 20px internal padding and 140px max height constraint
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 4.1 Add sparkline chart to KPI Card
  - Integrate Recharts AreaChart for sparkline visualization
  - Configure 40px height and 0.6 opacity
  - Implement gradient fill from accent color to transparent
  - Add 1500ms ease-in-out animation
  - Support 30 data points for smooth curves
  - _Requirements: 1.3, 2.7_

- [ ]* 4.2 Write property test for KPI card structure
  - **Property 3: KPI Card Structure Completeness**
  - **Property 8: KPI Card Height Constraint**
  - **Property 9: Delta Badge Color Coding**
  - **Validates: Requirements 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ]* 4.3 Write unit tests for KPI Card component
  - Test rendering with all required elements
  - Test delta badge color mapping (up/down/neutral)
  - Test sparkline rendering with data
  - Test height constraint (≤140px)
  - Test gradient and solid background variants
  - _Requirements: 1.3, 2.2, 2.6, 2.7, 2.8_

### Phase 4: Chart Components

- [ ] 5. Implement Chart Card wrapper component
  - Create `src/components/dashboard/ChartCard.tsx` with TypeScript interface
  - Inherit card styling from base Card component (14px radius, 20px padding, soft shadow)
  - Implement header section with title (16px, semibold) and icon (20px in colored circle)
  - Add actions slot for buttons/dropdowns
  - Enforce 320px max height constraint
  - Use softer colors and lighter borders for visual subordination
  - _Requirements: 3.2, 3.8, 3.9_

- [ ] 5.1 Implement Donut Chart component
  - Create `src/components/dashboard/charts/DonutChart.tsx` using Recharts
  - Configure center label with primary metric
  - Position legend on right side
  - Use design system colors (primary, secondary, warning, info)
  - Set stroke width to 12px, inner radius 60%, outer radius 80%
  - Ensure chart + legend fits within 320px card height
  - _Requirements: 3.1, 3.3_

- [ ] 5.2 Implement Line Chart component
  - Create `src/components/dashboard/charts/LineChart.tsx` using Recharts
  - Support maximum 2 lines with smooth curves (monotone interpolation)
  - Configure subtle grid lines (gray-200 light, gray-700 dark)
  - Set stroke width to 2px, dot size 4px on hover
  - Implement tooltip on hover with relevant data
  - Use muted accent colors for subordination
  - _Requirements: 3.4, 3.5, 3.6_

- [ ]* 5.3 Write property test for chart card constraints
  - **Property 12: Chart Card Height Constraint**
  - **Property 13: Chart Color System**
  - **Property 14: Chart Tooltip Interaction**
  - **Property 15: Chart Theme Consistency**
  - **Validates: Requirements 3.2, 3.3, 3.6, 3.7**

- [ ]* 5.4 Write unit tests for chart components
  - Test donut chart rendering with data
  - Test line chart rendering with multiple lines
  - Test chart color mapping to design system
  - Test tooltip display on hover
  - Test theme switching (light/dark)
  - Test height constraint (≤320px)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

### Phase 5: Data Table Component

- [ ] 6. Implement Data Table component
  - Create `src/components/dashboard/DataTable.tsx` with TypeScript interfaces
  - Inherit card styling (14px radius, 20px padding, base shadow only)
  - Implement table structure with 56px row height and 12px cell padding
  - Configure sticky header with gray-50 (light) / gray-700 (dark) background
  - Implement row hover states (gray-50 light, gray-700 dark)
  - Use gray-200/gray-700 borders only (no stronger borders)
  - Ensure header font size ≤14px (never exceed KPI label size)
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7_

- [ ] 6.1 Add status badge component for table cells
  - Create `src/components/dashboard/StatusBadge.tsx`
  - Implement pill-shaped badges (4px 12px padding, 12px border radius)
  - Map status to colors: success (green), info (blue), warning (yellow), danger (red)
  - Use 12px font size with 600 weight
  - _Requirements: 4.4_

- [ ] 6.2 Add responsive table behavior
  - Implement horizontal scroll for mobile viewports (<768px)
  - Ensure minimum 44px touch targets on mobile
  - Test table adaptation at all breakpoints
  - _Requirements: 4.6, 5.5, 5.7_

- [ ]* 6.3 Write property test for table specifications
  - **Property 17: Table Row Specifications**
  - **Property 18: Status Badge Color Mapping**
  - **Property 19: Table Row Hover State**
  - **Property 20: Table Responsive Behavior**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.5, 5.7**

- [ ]* 6.4 Write unit tests for table component
  - Test table rendering with data
  - Test sticky header behavior
  - Test row hover states
  - Test status badge color mapping
  - Test responsive horizontal scroll
  - Test cell padding and row height
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

### Phase 6: Layout Structure

- [ ] 7. Implement Top Bar component
  - Create `src/components/layout/TopBar.tsx`
  - Set fixed 72px height with sticky positioning
  - Implement layout: logo (32px), search (320px at >1280px, icon-only at ≤1280px), notifications, user menu, theme toggle
  - Use 16px gap between elements, 40px touch targets for icons
  - Maintain visual neutrality (no gradients, accent colors, or elevation beyond base shadow)
  - Use gray scale only for notification badges
  - Ensure search collapses to icon-only at ≤1280px
  - _Requirements: 1.7, 6.8_

- [ ]* 7.1 Write property test for top bar specifications
  - **Property 5: Top Bar Specifications**
  - **Validates: Requirements 1.7**

- [ ] 8. Implement Sidebar component
  - Create `src/components/layout/Sidebar.tsx`
  - Set width: 260px (desktop), 220px (tablet), drawer overlay (mobile)
  - Implement navigation items with 44px height, 12px 16px padding, 8px border radius
  - Configure states: default (transparent), hover (gray-100/gray-700), active (primary-50/primary-900)
  - Add icon (20px) + label (14px medium) with 12px gap
  - Implement collapsible behavior for tablet and drawer for mobile
  - _Requirements: 1.6, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 8.1 Write property test for sidebar responsive behavior
  - **Property 36: Sidebar Responsive Width**
  - **Property 37: Navigation Item Structure**
  - **Property 38: Navigation Active State**
  - **Property 39: Navigation Hover State**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 9. Implement App Shell layout
  - Create `src/components/layout/AppShell.tsx`
  - Configure fixed sidebar (260px desktop, 220px tablet, drawer mobile)
  - Set content area max-width to 1440px with responsive padding (24px desktop, 20px tablet, 16px mobile)
  - Implement 24px header-to-content spacing below topbar
  - Implement 24px sidebar-to-content horizontal spacing
  - Ensure proper z-index layering (topbar: 50)
  - _Requirements: 1.6, 1.8, 8.5, 8.6_

- [ ]* 9.1 Write property test for layout constraints
  - **Property 6: Content Area Constraints**
  - **Property 30: Layout Spacing System**
  - **Validates: Requirements 1.8, 8.5, 8.6**

### Phase 7: Dashboard Page Assembly

- [ ] 10. Create KPI cards grid layout
  - Update `src/app/dashboard/page.tsx` to use new KPI Card component
  - Implement responsive grid: 4 columns (desktop ≥1024px), 2 columns (tablet 768-1023px), 1 column (mobile <768px)
  - Use CSS Grid with equal-width columns: `grid-template-columns: repeat(auto-fit, minmax(0, 1fr))`
  - Set 20px gap between cards
  - Ensure cards maintain equal width regardless of content
  - Map existing dashboard data to KPI cards (revenue, orders, products, completion rate)
  - _Requirements: 1.1, 1.2, 1.5, 5.1, 5.2, 5.3_

- [ ]* 10.1 Write property test for responsive KPI grid
  - **Property 1: Responsive KPI Grid Layout**
  - **Property 2: Equal-Width KPI Cards**
  - **Property 4: Card Gap Consistency**
  - **Validates: Requirements 1.1, 1.2, 1.5, 5.1, 5.2, 5.3**

- [ ] 11. Implement analytics row with charts
  - Add analytics section below KPI cards with 32px spacing (desktop)
  - Create 2-column grid for chart cards (equal-width using 1fr units)
  - Implement Sales Source donut chart using existing data
  - Implement Statistics line chart using existing data
  - Ensure maximum 2 charts in analytics row (no third chart)
  - Verify chart legends wrap inside card without increasing height
  - Set 20px gap between chart cards
  - _Requirements: 3.1, 3.4, 8.4_

- [ ]* 11.1 Write property test for chart responsive behavior
  - **Property 23: Chart Responsive Width**
  - **Validates: Requirements 5.6**

- [ ] 12. Update tables section with new table component
  - Replace existing table implementations with new DataTable component
  - Position tables AFTER first scroll (not in above-the-fold area)
  - Implement Recent Orders table with existing data
  - Implement Top Products table with existing data
  - Use responsive grid for table layout
  - Ensure tables use gray-200/gray-700 borders only
  - Verify table headers ≤14px font size
  - Verify table shadow ≤ base shadow (same as KPI cards)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 13. Checkpoint - Verify viewport budget compliance
  - Test on 1440px width screen
  - Verify all KPI cards visible without scroll
  - Verify above-the-fold contains ONLY: Topbar (72px) + KPI cards (≤140px + 20px gap) + ONE analytics row (≤320px)
  - Verify analytics row contains maximum 2 chart cards
  - Verify tables appear AFTER first scroll
  - Measure total above-the-fold height (should be ≤608px)
  - _Requirements: 1.9, 1.10, 2.10_

- [ ]* 13.1 Write property test for viewport budget compliance
  - **Property 7: Viewport Budget Compliance (Critical)**
  - **Validates: Requirements 1.9, 1.10, 2.10**

### Phase 8: Responsive Behavior

- [ ] 14. Implement responsive spacing system
  - Update all components to use responsive spacing values
  - Section vertical spacing: 32px (desktop), 24px (tablet), 20px (mobile)
  - Content padding: 24px (desktop), 20px (tablet), 16px (mobile)
  - Verify spacing consistency across all components
  - _Requirements: 5.4, 8.4, 8.9_

- [ ]* 14.1 Write property test for responsive spacing
  - **Property 21: Responsive Spacing Scale**
  - **Property 32: Spacing Consistency**
  - **Validates: Requirements 5.4, 8.4, 8.9**

- [ ] 15. Implement mobile touch targets
  - Verify all interactive elements have minimum 44px touch targets on mobile
  - Update button sizes, icon buttons, and navigation items as needed
  - Test touch interactions on mobile viewport
  - _Requirements: 5.5, 10.2_

- [ ]* 15.1 Write property test for mobile touch targets
  - **Property 22: Mobile Touch Targets**
  - **Validates: Requirements 5.5**

- [ ] 16. Test responsive breakpoint transitions
  - Test layout at all breakpoints: mobile (<768px), tablet (768-1023px), desktop (≥1024px)
  - Verify KPI grid columns: 1 (mobile), 2 (tablet), 4 (desktop)
  - Verify sidebar behavior: drawer (mobile), collapsible (tablet), fixed (desktop)
  - Verify search collapse at ≤1280px
  - Test chart and table responsiveness
  - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_

- [ ]* 16.1 Write unit tests for responsive behavior
  - Test KPI grid at different viewports
  - Test sidebar behavior at different viewports
  - Test chart width adaptation
  - Test table horizontal scroll on mobile
  - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_

### Phase 9: Loading and Error States

- [ ] 17. Implement loading states
  - Create skeleton loader for KPI cards in `src/components/dashboard/KPICardSkeleton.tsx`
  - Create loading spinner for charts
  - Create skeleton rows for tables
  - Update dashboard page to show loading states during data fetch
  - Maintain layout structure during loading (prevent layout shift)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 17.1 Write property test for loading state indicators
  - **Property 33: Loading State Indicators**
  - **Validates: Requirements 9.2, 9.3, 9.4**

- [ ] 18. Implement error states
  - Create error state component with retry button
  - Add error boundaries for component-level error handling
  - Display user-friendly error messages
  - Implement retry functionality
  - _Requirements: 9.5_

- [ ]* 18.1 Write property test for error state display
  - **Property 34: Error State Display**
  - **Validates: Requirements 9.5**

- [ ] 19. Implement optimistic UI updates
  - Add optimistic updates for user actions (if applicable)
  - Ensure immediate UI feedback before server response
  - Handle rollback on server error
  - _Requirements: 9.6_

- [ ]* 19.1 Write property test for optimistic updates
  - **Property 35: Optimistic UI Updates**
  - **Validates: Requirements 9.6**

### Phase 10: Visual Hierarchy and Polish

- [ ] 20. Verify visual hierarchy compliance
  - Verify KPI cards are most prominent (primary focus)
  - Verify charts are visually subordinate (softer colors, lighter borders)
  - Verify tables are visually subordinate (gray borders, base shadow only, ≤14px headers)
  - Verify top bar remains visually neutral (no gradients, accent colors)
  - Verify no component exceeds KPI card visual weight
  - _Requirements: 3.9, 7.5, 7.6_

- [ ] 21. Implement component grid alignment
  - Verify all components align to shared grid system
  - Check consistent alignment points across sections
  - Ensure proper spacing communicates grouping
  - _Requirements: 8.8, 8.11_

- [ ]* 21.1 Write property test for component alignment
  - **Property 31: Component Grid Alignment**
  - **Validates: Requirements 8.8**

- [ ] 22. Verify color system consistency
  - Test all components use design system colors
  - Verify primary (green) for main actions and positive states
  - Verify secondary (blue) for secondary actions
  - Verify accent colors only for states (success, warning, danger, info)
  - Test color consistency across light and dark modes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ]* 22.1 Write unit tests for color system
  - Test primary color usage
  - Test secondary color usage
  - Test accent color usage
  - Test color consistency across components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

### Phase 11: Dark Mode Implementation

- [ ] 23. Implement dark mode for all components
  - Update KPI cards for dark mode (gray-800 background, gray-100 text)
  - Update charts for dark mode (muted accent colors)
  - Update tables for dark mode (gray-800 surface, gray-700 borders)
  - Update layout components for dark mode (gray-900 background)
  - Test theme toggle functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 23.1 Write property test for dark mode chart colors
  - **Property 25: Dark Mode Chart Colors**
  - **Validates: Requirements 6.6**

- [ ]* 23.2 Write unit tests for dark mode
  - Test KPI card dark mode styling
  - Test chart dark mode colors
  - Test table dark mode styling
  - Test layout dark mode backgrounds
  - Test theme toggle functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8_

### Phase 12: Final Validation and Testing

- [ ] 24. Run complete validation checklist
  - [ ] All KPI cards visible in first viewport on 1440px screen (no scroll)
  - [ ] Above-the-fold contains ONLY: Topbar + KPI cards + ONE analytics row
  - [ ] Analytics row contains maximum 2 chart cards (no third chart)
  - [ ] Charts use equal-width grid columns (1fr units)
  - [ ] Chart legends wrap inside card without increasing height
  - [ ] Tables appear AFTER first scroll (not above-the-fold)
  - [ ] KPI cards use equal-width grid columns (content doesn't affect width)
  - [ ] KPI card height ≤ 140px
  - [ ] Chart card height ≤ 320px (header + chart + legend)
  - [ ] Only defined spacing values used (16, 20, 24, 32px)
  - [ ] All cards follow KPI card visual language
  - [ ] No component exceeds KPI card visual weight
  - [ ] Top bar remains visually neutral (no gradients, accent colors)
  - [ ] Top bar shadow ≤ base shadow
  - [ ] Search collapses to icon-only at ≤1280px
  - [ ] Notification badges use gray scale only
  - [ ] Table headers ≤ 14px font size (KPI label size)
  - [ ] Table borders use gray-200/gray-700 only
  - [ ] Table shadow ≤ base shadow (same as KPI cards)
  - [ ] Content overflow uses ellipsis truncation, not height increase
  - [ ] Empty space serves grouping purpose only
  - [ ] Design defaults to smaller/flatter/denser when unclear
  - _Requirements: All_

- [ ] 25. Run accessibility tests
  - Run jest-axe automated accessibility tests
  - Verify WCAG AA contrast ratios in both light and dark modes
  - Test keyboard navigation through all interactive elements
  - Verify ARIA labels and roles
  - Test screen reader compatibility
  - _Requirements: 6.7_

- [ ]* 25.1 Write accessibility unit tests
  - Test keyboard navigation
  - Test ARIA labels
  - Test focus indicators
  - Test contrast ratios
  - _Requirements: 6.7_

- [ ] 26. Run performance tests
  - Measure initial page load time (target: <2 seconds)
  - Measure time to interactive
  - Measure first contentful paint
  - Measure largest contentful paint
  - Measure cumulative layout shift
  - Run Lighthouse audit
  - _Requirements: 9.1_

- [ ]* 26.1 Write performance unit tests
  - Test component render performance
  - Test data fetching performance
  - Test memoization effectiveness
  - _Requirements: 9.1_

- [ ] 27. Final checkpoint - Complete implementation review
  - Review all validation checklist items
  - Verify all requirements are met
  - Test on multiple devices and browsers
  - Verify no regressions in existing functionality
  - Document any deviations from design (if approved)
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of critical constraints
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation must strictly follow the design system tokens and spacing values
- When in doubt, default to smaller, flatter, denser designs
- All components must inherit visual language from KPI card design
- Viewport budget compliance is the primary validation criterion

## Testing Configuration

**Property-Based Testing**:
- Library: `fast-check` (already installed)
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: modern-dashboard-redesign, Property {number}: {property_text}`

**Unit Testing**:
- Library: Jest with React Testing Library
- Focus on specific examples, edge cases, and user interactions
- Test component rendering, state changes, and integration points

**Visual Regression Testing**:
- Tool: Playwright or Chromatic (to be configured)
- Test light/dark modes, responsive breakpoints, hover states

**Accessibility Testing**:
- Tool: jest-axe
- Verify WCAG AA compliance
- Test keyboard navigation and screen reader compatibility

## Success Criteria

Implementation is complete when:
1. All validation checklist items pass
2. All property tests pass (100 iterations each)
3. All unit tests pass
4. Accessibility tests pass (WCAG AA)
5. Performance targets met (<2 second load time)
6. Visual regression tests pass
7. Manual testing confirms responsive behavior across devices
8. No regressions in existing dashboard functionality
