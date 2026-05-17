# Books Car Rental -- Component Library Specifications

Version 1.0 | React + TypeScript | Lucide Icons

---

## 1. Buttons

### Variants

| Variant     | Background          | Text Color     | Border            | Hover Background     |
|-------------|---------------------|----------------|-------------------|----------------------|
| `primary`   | `#2563EB`           | `#FFFFFF`      | none              | `#1D4ED8`            |
| `secondary` | `#F59E0B`           | `#FFFFFF`      | none              | `#D97706`            |
| `outline`   | transparent         | `#2563EB`      | 1px `#2563EB`     | `#EFF6FF`            |
| `ghost`     | transparent         | `#475569`      | none              | `#F1F5F9`            |
| `danger`    | `#E11D48`           | `#FFFFFF`      | none              | `#BE123C`            |

### Sizes

| Size   | Height | Padding (H)  | Font Size | Icon Size | Border Radius |
|--------|--------|--------------|-----------|-----------|---------------|
| `sm`   | 32px   | 12px         | 14px      | 16px      | 6px           |
| `md`   | 40px   | 16px         | 14px      | 18px      | 8px           |
| `lg`   | 48px   | 20px         | 16px      | 20px      | 8px           |
| `xl`   | 56px   | 24px         | 16px      | 20px      | 12px          |

### States

- **Default:** Normal appearance
- **Hover:** Slightly darker background, cursor pointer
- **Active/Pressed:** scale(0.98) transform, darkest shade
- **Focused:** `--focus-ring` applied
- **Disabled:** opacity 0.5, cursor not-allowed, no pointer events
- **Loading:** Text replaced with spinner (16px), disabled interaction

### Button Anatomy

```
+--[icon?]--[label]--[icon?]--+
|        min-width: 0         |
|    gap: 8px between items   |
+-----------------------------+
```

### Full-Width CTA Button (Mobile)

Used at the bottom of forms and checkout flows.

```css
.btn-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  z-index: 200;
}

.btn-cta button {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}
```

---

## 2. Input Fields

### Text Input

```
+------------------------------------------+
| [icon?] [label floats up on focus]       |
| [icon?] [value / placeholder]            |
+------------------------------------------+
  [helper text or error message]
```

### Specifications

| Property           | Value                                    |
|--------------------|------------------------------------------|
| Height             | 48px (mobile), 44px (desktop)            |
| Padding            | 12px horizontal, centered vertical       |
| Background         | `#FFFFFF`                                |
| Border             | 1px solid `#E2E8F0`                      |
| Border (focus)     | 2px solid `#2563EB`                      |
| Border (error)     | 2px solid `#E11D48`                      |
| Border (success)   | 2px solid `#059669`                      |
| Border radius      | 8px                                      |
| Font size          | 16px (prevents iOS zoom)                 |
| Placeholder color  | `#94A3B8`                                |
| Label size         | 14px, `#475569`                          |
| Label (focused)    | 12px, `#2563EB`, translated up           |
| Helper text        | 12px, `#64748B`                          |
| Error text         | 12px, `#E11D48`                          |
| Icon color         | `#94A3B8` (default), `#2563EB` (focused) |

### Input Variants

**Phone Number Input**
```
+----+------------------------------------------+
| +91| [Mobile number]                           |
| v  |                                          |
+----+------------------------------------------+
```
- Country code selector on left (40px width)
- Numeric keyboard on mobile (`inputMode="tel"`)
- Auto-format: XXX XXX XXXX

**Password Input**
```
+------------------------------------------+---+
| [Password]                               |eye|
+------------------------------------------+---+
```
- Toggle visibility icon (Eye / EyeOff)
- Strength indicator bar below (4 segments: red, orange, yellow, green)

**Search Input**
```
+---+------------------------------------------+---+
| Q | [Search cars, routes...]                 | X |
+---+------------------------------------------+---+
```
- Search icon prefix
- Clear button (X) when has value
- No border, uses shadow-sm for elevation
- Border radius: 9999px (pill shape)
- Background: `#F1F5F9`

**Date Input**
```
+---+------------------------------------------+---+
| C | [Select date]                            | > |
+---+------------------------------------------+---+
```
- Calendar icon prefix
- Opens native date picker on mobile
- Custom date picker modal on desktop
- Display format: "Mon, 15 Jan 2026"

**Textarea**
- Min height: 96px
- Auto-grow up to 200px
- Character counter at bottom right

---

## 3. Cards

### Car Card

```
+------------------------------------------+
| +--------------------------------------+ |
| |                                      | |
| |        [Car Image - 16:9]            | |
| |                                      | |
| +--------------------------------------+ |
| [AC] [4 Seater] [Diesel]   <-- chips     |
|                                          |
| Swift Dzire                 <-- h4 600   |
| or similar sedan            <-- body-sm  |
|                                          |
| Rs 2,500/day                <-- h4 700   |
| [Select Car]                <-- btn sm   |
+------------------------------------------+
```

| Property        | Value                              |
|-----------------|------------------------------------|
| Width           | 100% (mobile), 280px (grid)        |
| Border radius   | 12px                               |
| Background      | `#FFFFFF`                          |
| Shadow          | `--shadow-sm`, `--shadow-md` hover |
| Padding         | 0 (image), 16px (content)          |
| Image height    | 180px, object-fit: cover           |
| Gap             | 8px between elements               |

### Booking Card

```
+------------------------------------------+
| [Booking #BCR-1234]    [Confirmed] badge |
|                                          |
| +---+  Mumbai .......................... |
| | | |  to                               |
| +---+  Pune                             |
|                                          |
| Mon, 15 Jan  |  09:00 AM  |  Swift Dzire|
|                                          |
| ----------------------------------------|
| Rs 3,500         [View Details ->]       |
+------------------------------------------+
```

| Property        | Value                              |
|-----------------|------------------------------------|
| Width           | 100%                               |
| Border radius   | 12px                               |
| Background      | `#FFFFFF`                          |
| Shadow          | `--shadow-sm`                      |
| Padding         | 16px                               |
| Border-left     | 4px solid (color by status)        |

**Border-left colors by status:**
- Pending: `#F59E0B`
- Confirmed: `#2563EB`
- In Progress: `#8B5CF6`
- Completed: `#059669`
- Cancelled: `#E11D48`

### Route Card

```
+------------------------------------------+
| Mumbai --> Pune               3h 30m     |
| 150 km                     Rs 2,500      |
| [Popular]                                |
+------------------------------------------+
```

| Property        | Value                 |
|-----------------|-----------------------|
| Border radius   | 8px                   |
| Background      | `#FFFFFF`            |
| Border          | 1px solid `#E2E8F0`  |
| Padding         | 12px 16px            |

### Stat Card (Admin Dashboard)

```
+------------------------------------------+
| Total Bookings               [icon: Cal] |
| 1,234                                    |
| +12% from last month        [sparkline]  |
+------------------------------------------+
```

| Property        | Value                              |
|-----------------|------------------------------------|
| Width           | 1/2 (mobile), 1/4 (desktop)       |
| Border radius   | 12px                               |
| Background      | `#FFFFFF`                          |
| Shadow          | `--shadow-sm`                      |
| Padding         | 20px                               |
| Value font      | 30px, weight 700                   |
| Label font      | 14px, `#475569`                    |
| Trend font      | 12px, green (up) or red (down)     |

### Driver Card

```
+------------------------------------------+
| +------+  Rajesh Kumar                   |
| |avatar|  4.8 [star] | 234 rides         |
| +------+  [Available]                    |
|                                          |
| Swift Dzire (MH 12 AB 1234)             |
| [Assign] [View Profile]                 |
+------------------------------------------+
```

---

## 4. Bottom Navigation Bar (Mobile)

```
+----+--------+--------+--------+--------+----+
|    |  Home  |Bookings| Track  |Profile |    |
|    |  [ic]  |  [ic]  |  [ic]  |  [ic]  |    |
+----+--------+--------+--------+--------+----+
     ^^^^^^^^  active tab
```

### Specifications

| Property          | Value                                  |
|-------------------|----------------------------------------|
| Height            | 64px + safe-area-inset-bottom          |
| Background        | `#FFFFFF`                              |
| Border top        | 1px solid `#E2E8F0`                    |
| Shadow            | `0 -2px 10px rgba(15,23,42,0.05)`      |
| Position          | fixed bottom                           |
| z-index           | 200                                    |
| Icon size         | 24px                                   |
| Label size        | 12px, weight 500                       |
| Active color      | `#2563EB`                              |
| Inactive color    | `#94A3B8`                              |
| Active indicator  | 3px wide dot below icon, `#2563EB`     |
| Tab width         | equal (25% each)                       |
| Touch target      | full tab area, min 48px wide           |

### Tab Items

| Tab      | Icon            | Label     | Route             |
|----------|-----------------|-----------|-------------------|
| Home     | `Home`          | Home      | `/customer`       |
| Bookings | `CalendarCheck` | Bookings  | `/customer/bookings` |
| Track    | `MapPin`        | Track     | `/customer/track` |
| Profile  | `User`          | Profile   | `/customer/profile` |

---

## 5. Top App Bar

### Default (with title)

```
+------------------------------------------+
| [<-]  Page Title             [action?]   |
+------------------------------------------+
```

### Search variant

```
+------------------------------------------+
| [<-]  [Search input........................] |
+------------------------------------------+
```

### Specifications

| Property          | Value                           |
|-------------------|---------------------------------|
| Height            | 56px + safe-area-inset-top      |
| Background        | `#FFFFFF`                       |
| Border bottom     | 1px solid `#E2E8F0`            |
| Position          | sticky top                      |
| z-index           | 100                             |
| Title font        | 18px, weight 600                |
| Back button       | 40px touch target, ChevronLeft  |
| Action button     | 40px touch target               |

---

## 6. Bottom Sheets (Mobile Modals)

```
+------------------------------------------+
|            [drag handle]                 |
|  Sheet Title              [X close?]     |
|  ======================================  |
|                                          |
|  [Sheet content scrollable]              |
|                                          |
|                                          |
+------------------------------------------+
| [Action Button - full width]             |
+------------------------------------------+
```

### Specifications

| Property           | Value                                  |
|--------------------|----------------------------------------|
| Background         | `#FFFFFF`                              |
| Border radius      | 16px 16px 0 0 (top corners only)       |
| Drag handle        | 36px x 4px, `#CBD5E1`, centered        |
| Padding top        | 8px (above handle) + 16px (below)      |
| Padding horizontal | 16px                                   |
| Max height         | 90vh                                   |
| Snap points        | 40%, 70%, 90% of viewport height       |
| Overlay            | `rgba(15, 23, 42, 0.5)`               |
| Animation          | slide up with spring easing, 350ms     |
| Dismiss            | swipe down, tap overlay, X button      |
| z-index            | 400                                    |

---

## 7. Status Badges

```
[  Confirmed  ]
```

| Status        | Background | Text Color | Icon           |
|---------------|------------|------------|----------------|
| `pending`     | `#FEF3C7`  | `#B45309`  | `Clock`        |
| `confirmed`   | `#DBEAFE`  | `#1E40AF`  | `CheckCircle`  |
| `in_progress` | `#F3E8FF`  | `#7C3AED`  | `Navigation`   |
| `completed`   | `#D1FAE5`  | `#047857`  | `CheckCircle`  |
| `cancelled`   | `#FFE4E6`  | `#BE123C`  | `XCircle`      |

### Specifications

| Property        | Value                     |
|-----------------|---------------------------|
| Height          | 24px                      |
| Padding         | 4px 10px                  |
| Font size       | 12px                      |
| Font weight     | 600                       |
| Border radius   | 9999px (pill)             |
| Icon size       | 12px, 4px gap from text   |
| Text transform  | capitalize                |

---

## 8. Loading States -- Skeleton Screens

Use skeleton screens instead of spinners for all content loading.

### Skeleton Block

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F1F5F9 25%,
    #E2E8F0 50%,
    #F1F5F9 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Skeleton Variants

**Car Card Skeleton**
```
+------------------------------------------+
| +--------------------------------------+ |
| |        [skeleton 180px h]            | |
| +--------------------------------------+ |
| [=== 60px ===] [=== 60px ===]           |
| [========= 140px =========]             |
| [====== 80px ======]                    |
| [========= 100px =========]             |
+------------------------------------------+
```

**Booking Card Skeleton**
```
+------------------------------------------+
| [=== 120px ===]       [=== 80px ===]     |
| [============= 200px ==============]     |
| [=== 80px ===] [=== 80px ===] [80px]    |
| ---------------------------------------- |
| [=== 80px ===]       [=== 100px ===]    |
+------------------------------------------+
```

**List Item Skeleton**
```
+------------------------------------------+
| [O 40px]  [========= 160px =========]   |
|           [======= 120px =======]        |
+------------------------------------------+
```

---

## 9. Toast Notifications

```
+--[icon]--[message text]----------[close]-+
+------------------------------------------+
```

### Specifications

| Property         | Value                                   |
|------------------|-----------------------------------------|
| Position         | top: 16px + safe-area, centered         |
| Width            | calc(100% - 32px), max 400px            |
| Background       | `#0F172A` (dark) for contrast           |
| Text color       | `#FFFFFF`                               |
| Border radius    | 12px                                    |
| Shadow           | `--shadow-lg`                           |
| Padding          | 12px 16px                               |
| Font size        | 14px                                    |
| Icon size        | 20px                                    |
| Auto dismiss     | 4 seconds (success), persistent (error) |
| Animation        | slide down + fade in, 250ms             |
| z-index          | 500                                     |

### Toast Variants

| Type      | Icon Color | Leading Icon     |
|-----------|------------|------------------|
| `success` | `#10B981`  | `CheckCircle`    |
| `error`   | `#F43F5E`  | `XCircle`        |
| `warning` | `#F97316`  | `AlertTriangle`  |
| `info`    | `#3B82F6`  | `Info`           |

---

## 10. Empty States

```
+------------------------------------------+
|                                          |
|          [illustration 120px]            |
|                                          |
|          No bookings yet                 |
|    Book your first car rental and        |
|    it will appear here                   |
|                                          |
|         [Browse Cars]                    |
|                                          |
+------------------------------------------+
```

### Specifications

| Property             | Value                       |
|----------------------|-----------------------------|
| Illustration size    | 120px x 120px               |
| Illustration style   | Muted line art, blue tint   |
| Title                | 20px, weight 600, `#0F172A` |
| Description          | 14px, `#64748B`, centered   |
| Max text width       | 280px                       |
| CTA button           | primary, size md            |
| Vertical spacing     | 16px between elements       |

### Empty State Contexts

| Page           | Title                    | CTA              |
|----------------|--------------------------|-------------------|
| Bookings       | No bookings yet          | Browse Cars       |
| Search results | No cars found            | Modify Search     |
| Track          | Nothing to track         | View Bookings     |
| Notifications  | All caught up            | --                |
| Admin drivers  | No drivers added         | Add Driver        |

---

## 11. Pull-to-Refresh

```
     [rotating refresh icon]
     Updating...
+------------------------------------------+
|  [content pulled down]                   |
+------------------------------------------+
```

### Specifications

| Property           | Value                           |
|--------------------|---------------------------------|
| Trigger distance   | 80px pull down                  |
| Indicator size     | 24px spinning icon              |
| Indicator color    | `#2563EB`                       |
| Background         | `#F8FAFC`                       |
| Animation          | rotate 360deg, 1s linear loop   |
| Snap back          | spring easing, 300ms            |

---

## 12. Swipe Actions on List Items

```
           <--- swipe left
+------------------------------------------+-------+-------+
| [Booking item content]                   | Edit  |Cancel |
|                                          | blue  | red   |
+------------------------------------------+-------+-------+
```

### Specifications

| Property           | Value                           |
|--------------------|---------------------------------|
| Swipe threshold    | 80px to reveal actions          |
| Action button width| 72px each                       |
| Action height      | matches list item               |
| Background (edit)  | `#2563EB`                       |
| Background (delete)| `#E11D48`                       |
| Icon               | 20px, white                     |
| Label              | 12px, white                     |
| Haptic             | light impact on threshold reach |

---

## 13. Step Indicator (Multi-Step Forms)

### Horizontal Steps (mobile)

```
  (1)-----(2)-----(3)-----(4)-----(5)
 Route   Date     Car    Review   Pay
  [done] [done] [active] [ ]     [ ]
```

### Specifications

| Property              | Value                          |
|-----------------------|--------------------------------|
| Circle size           | 28px                           |
| Active circle         | `#2563EB` fill, white text     |
| Completed circle      | `#059669` fill, white check    |
| Pending circle        | `#E2E8F0` fill, `#94A3B8` text |
| Connector line height | 2px                            |
| Completed line        | `#059669`                      |
| Pending line          | `#E2E8F0`                      |
| Label font            | 12px, weight 500               |
| Active label color    | `#2563EB`                      |
| Gap below circles     | 4px to label                   |

### Compact Progress Bar (alternative for mobile)

```
+==================------+  Step 3 of 5
```

| Property        | Value                    |
|-----------------|--------------------------|
| Height          | 4px                      |
| Background      | `#E2E8F0`               |
| Fill             | `#2563EB`               |
| Border radius   | 9999px                   |
| Label           | 12px, `#64748B`, right   |

---

## 14. Chips / Tags

```
[AC]  [4 Seater]  [Diesel]  [+ Add Stop]
```

### Specifications

| Variant       | Background | Text Color | Border         |
|---------------|------------|------------|----------------|
| `filled`      | `#F1F5F9`  | `#334155`  | none           |
| `outlined`    | transparent| `#475569`  | 1px `#E2E8F0`  |
| `selected`    | `#DBEAFE`  | `#1E40AF`  | 1px `#93C5FD`  |
| `removable`   | `#F1F5F9`  | `#334155`  | none           |

| Property        | Value                     |
|-----------------|---------------------------|
| Height          | 28px                      |
| Padding         | 4px 12px                  |
| Font size       | 12px, weight 500          |
| Border radius   | 9999px                    |
| Icon size       | 14px                      |
| Gap (icon-text) | 4px                       |

---

## 15. Dividers

| Variant          | Style                                    |
|------------------|------------------------------------------|
| Full width       | 1px solid `#E2E8F0`, full width          |
| Inset            | 1px solid `#E2E8F0`, 16px left margin   |
| With label       | Line + centered text ("or") + line       |
| Spacing          | 16px vertical margin (default)           |

---

## 16. Avatar

| Size   | Pixels | Border Radius | Usage                    |
|--------|--------|---------------|--------------------------|
| `xs`   | 24px   | full          | Inline mentions          |
| `sm`   | 32px   | full          | List items               |
| `md`   | 40px   | full          | Cards, comments          |
| `lg`   | 56px   | full          | Profile headers          |
| `xl`   | 80px   | full          | Profile page             |
| `2xl`  | 120px  | full          | Profile edit             |

- Fallback: initials on `#DBEAFE` background, `#1E40AF` text
- Border: 2px solid `#FFFFFF` when overlapping (avatar groups)
- Online indicator: 10px green dot at bottom-right

---

## 17. Rating Component

```
  [*] [*] [*] [*] [.]     4.0
```

### Input Mode (tap to rate)

| Property        | Value                     |
|-----------------|---------------------------|
| Star size       | 32px (tappable), 44px touch target |
| Filled color    | `#F59E0B`                |
| Empty color     | `#E2E8F0`                |
| Gap             | 4px                      |
| Animation       | scale(1.2) on tap, 150ms |

### Display Mode (read-only)

| Property        | Value                     |
|-----------------|---------------------------|
| Star size       | 16px                     |
| Filled color    | `#F59E0B`                |
| Half-star       | clip-path half fill      |
| Number          | 14px, weight 600, `#0F172A` |
