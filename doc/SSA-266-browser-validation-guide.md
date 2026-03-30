# Browser Validation Guide — SSA-260 Responsive Spacing Refinement

**Epic:** SSA-260  
**Date:** 2026-03-30  
**Status:** Ready for Manual Validation  

---

## Quick Start

```bash
# Start dev server
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
npm run dev

# Open Chrome DevTools > Device Toolbar (Cmd+Shift+M)
# Test each breakpoint below
```

---

## Breakpoint Validation Matrix

### Mobile S (375px)
**Devices:** iPhone SE, small Android phones

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Navbar collapses to hamburger<br>- Hero stacks vertically<br>- Feature cards single column<br>- No horizontal scroll | ⏳ |
| `/login` | - Card padding comfortable (20px)<br>- Form inputs ≥44px height<br>- Logo scaled appropriately | ⏳ |
| `/signup` | - Same as login<br>- All fields visible without zoom | ⏳ |
| `/teacher/dashboard` | - Stat cards stack vertically<br>- Teaching Focus below assignments<br>- Curriculum 2-column grid<br>- Bottom nav clearance OK | ⏳ |
| `/teacher/classes` | - Create form stacks above list<br>- Class cards actions vertical<br>- Icon ≥44px tap target | ⏳ |
| `/teacher/classes/[id]/attendance` | - Summary cards stack<br>- Table degrades gracefully<br>- Date picker accessible | ⏳ |
| `/teacher/question-bank` | - Taxonomy full width<br>- Empty state centered<br>- Question cards readable | ⏳ |
| `/teacher/profile` | - Form single column<br>- Sidebar cards stack<br>- All inputs accessible | ⏳ |
| `/student/assignment/[linkId]` | - Identity card fits<br>- Question single column<br>- Progress bar visible<br>- Submit button accessible | ⏳ |

---

### Mobile L (412px)
**Devices:** iPhone 14/15 Pro Max, large Android

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Slightly more breathing room<br>- Hero image scales well | ⏳ |
| `/login` `/signup` | - Card feels less cramped<br>- Decorative elements visible | ⏳ |
| `/teacher/dashboard` | - Stat cards may show 2 per row<br>- Better table readability | ⏳ |
| `/teacher/classes` | - Class cards show more content<br>- Actions may go inline | ⏳ |
| `/teacher/classes/[id]/attendance` | - Summary cards may show 2 per row | ⏳ |
| `/teacher/question-bank` | - Better question card spacing | ⏳ |
| `/teacher/profile` | - Sidebar may show 2 columns | ⏳ |
| `/student/assignment/[linkId]` | - Assessment more comfortable<br>- Options may show 2 per row | ⏳ |

---

### Tablet (768px)
**Devices:** iPad, small tablets

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Navbar may show desktop<br>- Hero 2-column possible<br>- Features 2-3 columns | ⏳ |
| `/login` `/signup` | - Desktop layout begins<br>- Card centered | ⏳ |
| `/teacher/dashboard` | - Stat cards 2 per row<br>- Bento grid 2 columns<br>- Curriculum 4 columns | ⏳ |
| `/teacher/classes` | - Form + list side-by-side (1:2)<br>- Class cards inline actions | ⏳ |
| `/teacher/classes/[id]/attendance` | - Summary 3 columns<br>- Full table visible | ⏳ |
| `/teacher/question-bank` | - Taxonomy + questions grid<br>- Assignment tray visible | ⏳ |
| `/teacher/profile` | - Form + sidebar side-by-side | ⏳ |
| `/student/assignment/[linkId]` | - Assessment comfortable<br>- Options 2 columns | ⏳ |

---

### Tablet Pro (1024px)
**Devices:** iPad Pro, large tablets

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Desktop layout<br>- Hero full 2 columns<br>- Features 3 columns | ⏳ |
| `/login` `/signup` | - Full desktop card | ⏳ |
| `/teacher/dashboard` | - Stat cards 3-4 per row<br>- Full bento layout<br>- Curriculum 4-6 columns | ⏳ |
| `/teacher/classes` | - Desktop grid (1:2)<br>- Full card density | ⏳ |
| `/teacher/classes/[id]/attendance` | - Full table<br>- Date picker inline | ⏳ |
| `/teacher/question-bank` | - 3-panel layout (14rem/1fr/16rem)<br>- Taxonomy + questions + tray | ⏳ |
| `/teacher/profile` | - Full 2-column layout | ⏳ |
| `/student/assignment/[linkId]` | - Assessment full width<br>- Options 2 columns | ⏳ |

---

### Desktop (1440px)
**Devices:** MacBook Pro 14", laptops

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Premium whitespace<br>- Full feature grid<br>- Footer full width | ⏳ |
| `/login` `/signup` | - Card with decorative elements<br>- Comfortable whitespace | ⏳ |
| `/teacher/dashboard` | - Stat cards 4 columns<br>- Full bento 2fr/1fr<br>- Curriculum 6 columns | ⏳ |
| `/teacher/classes` | - Desktop layout<br>- Sidebar persistent | ⏳ |
| `/teacher/classes/[id]/attendance` | - Full table<br>- All columns visible | ⏳ |
| `/teacher/question-bank` | - Full 3-panel workspace<br>- Taxonomy sticky | ⏳ |
| `/teacher/profile` | - Form + insights side-by-side | ⏳ |
| `/student/assignment/[linkId]` | - Assessment centered<br>- Max-width 48rem | ⏳ |

---

### Desktop Large (1920px)
**Devices:** External monitors, iMac

| Route | Validation Points | Status |
|-------|------------------|--------|
| `/` | - Max-width containers<br>- No excessive stretching<br>- Decorative elements scale | ⏳ |
| `/teacher/*` | - Max-width 80rem containers<br>- Sidebar doesn't stretch<br>- Tables don't over-expand | ⏳ |
| `/student/*` | - Max-width 48rem assessment<br>- Centered canvas | ⏳ |

---

## Cross-Browser Checklist

### Chrome (Latest)
- [ ] All routes render correctly at all breakpoints
- [ ] No console errors
- [ ] Animations smooth (60fps)
- [ ] Form interactions work

### Safari (Latest)
- [ ] All routes render correctly at all breakpoints
- [ ] No console errors
- [ ] Backdrop blur works (nav, modals)
- [ ] Touch interactions responsive

### Firefox (Latest)
- [ ] All routes render correctly at all breakpoints
- [ ] No console errors
- [ ] Grid layouts render correctly
- [ ] Form styling consistent

---

## Specific Component Validation

### Navigation
- [ ] Mobile hamburger toggles smoothly
- [ ] Desktop nav items don't wrap
- [ ] Active states visible at all sizes
- [ ] Bottom nav (mobile) doesn't overlap content

### Forms
- [ ] All inputs ≥44px height on mobile/tablet
- [ ] Focus states visible
- [ ] Error messages readable
- [ ] Submit buttons accessible

### Cards
- [ ] Padding feels intentional, not empty
- [ ] Hover states work on desktop
- [ ] Content doesn't overflow
- [ ] Borders/shadows subtle

### Tables
- [ ] Headers readable
- [ ] Rows don't feel cramped
- [ ] Mobile degrades to cards/list
- [ ] No horizontal scroll

### Buttons
- [ ] ≥44px height on touch devices
- [ ] Text doesn't wrap awkwardly
- [ ] Icons aligned properly
- [ ] Disabled states clear

---

## Performance Checks

### Layout Shift
- [ ] No content jumps on load
- [ ] Images have dimensions
- [ ] Fonts load without FOUC

### Paint Performance
- [ ] Scroll smooth (60fps)
- [ ] Transitions under 300ms
- [ ] No janky animations

### Memory
- [ ] No memory leaks on navigation
- [ ] DevTools Performance tab clean

---

## Accessibility Checks

### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus visible
- [ ] Skip links work

### Screen Reader
- [ ] Headings hierarchical
- [ ] Alt text on images
- [ ] Form labels associated

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Interactive elements distinguishable
- [ ] Status colors accessible

---

## Issues Log

| Breakpoint | Route | Issue | Severity | Status |
|------------|-------|-------|----------|--------|
| | | | | |
| | | | | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Design | | | |
| Engineering | | | |
| QA | | | |
| Product | | | |

---

**Notes:**
- Use Chrome DevTools Device Toolbar for initial testing
- Validate on real devices before final sign-off
- Document any issues in the Issues Log above
- All critical issues must be resolved before merging
