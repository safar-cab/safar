# Books Car Rental -- Design System & Tokens

Version 1.0 | Mobile-First | Light Theme

---

## 1. Color Palette

### Primary -- Deep Blue (Trust, Reliability)

| Token                  | Hex       | Usage                                      |
|------------------------|-----------|---------------------------------------------|
| `--color-primary-50`   | `#EFF6FF` | Tinted backgrounds, hover states            |
| `--color-primary-100`  | `#DBEAFE` | Selected item backgrounds                   |
| `--color-primary-200`  | `#BFDBFE` | Light borders, focus rings                  |
| `--color-primary-300`  | `#93C5FD` | Inactive toggles                            |
| `--color-primary-400`  | `#60A5FA` | Hover accents                               |
| `--color-primary-500`  | `#3B82F6` | Links, active icons                         |
| `--color-primary-600`  | `#2563EB` | Primary buttons, active tabs                |
| `--color-primary-700`  | `#1D4ED8` | Button hover                                |
| `--color-primary-800`  | `#1E40AF` | Button pressed, headings                    |
| `--color-primary-900`  | `#1E3A8A` | Dark accents                                |

### Secondary -- Warm Amber (Energy, Attention)

| Token                    | Hex       | Usage                                    |
|--------------------------|-----------|-------------------------------------------|
| `--color-secondary-50`   | `#FFFBEB` | Highlight backgrounds                     |
| `--color-secondary-100`  | `#FEF3C7` | Badge backgrounds                         |
| `--color-secondary-200`  | `#FDE68A` | Star ratings (filled)                      |
| `--color-secondary-300`  | `#FCD34D` | Warning indicator light                    |
| `--color-secondary-400`  | `#FBBF24` | CTA accent, price tags                     |
| `--color-secondary-500`  | `#F59E0B` | Secondary buttons, icons                   |
| `--color-secondary-600`  | `#D97706` | Secondary button hover                     |
| `--color-secondary-700`  | `#B45309` | Secondary button pressed                   |

### Success -- Emerald Green

| Token                  | Hex       | Usage                                      |
|------------------------|-----------|---------------------------------------------|
| `--color-success-50`   | `#ECFDF5` | Success background                          |
| `--color-success-100`  | `#D1FAE5` | Success badge background                    |
| `--color-success-500`  | `#10B981` | Success icons, completed status             |
| `--color-success-600`  | `#059669` | Success text, confirmed badges              |
| `--color-success-700`  | `#047857` | Success dark                                |

### Error -- Rose Red

| Token                | Hex       | Usage                                        |
|----------------------|-----------|-----------------------------------------------|
| `--color-error-50`   | `#FFF1F2` | Error background                              |
| `--color-error-100`  | `#FFE4E6` | Error badge background                        |
| `--color-error-500`  | `#F43F5E` | Error icons, validation                       |
| `--color-error-600`  | `#E11D48` | Error text, destructive buttons               |
| `--color-error-700`  | `#BE123C` | Error dark                                    |

### Warning -- Orange

| Token                  | Hex       | Usage                                      |
|------------------------|-----------|---------------------------------------------|
| `--color-warning-50`   | `#FFF7ED` | Warning background                          |
| `--color-warning-100`  | `#FFEDD5` | Warning badge background                    |
| `--color-warning-500`  | `#F97316` | Warning icons                               |
| `--color-warning-600`  | `#EA580C` | Warning text                                |

### Neutrals -- Slate Gray Scale

| Token                  | Hex       | Usage                                      |
|------------------------|-----------|---------------------------------------------|
| `--color-neutral-50`   | `#F8FAFC` | Page background, subtle fills               |
| `--color-neutral-100`  | `#F1F5F9` | Card hover, section backgrounds             |
| `--color-neutral-200`  | `#E2E8F0` | Borders, dividers                           |
| `--color-neutral-300`  | `#CBD5E1` | Disabled text, placeholder                  |
| `--color-neutral-400`  | `#94A3B8` | Muted text, icons                           |
| `--color-neutral-500`  | `#64748B` | Secondary text                              |
| `--color-neutral-600`  | `#475569` | Body text                                   |
| `--color-neutral-700`  | `#334155` | Strong body text                            |
| `--color-neutral-800`  | `#1E293B` | Headings                                    |
| `--color-neutral-900`  | `#0F172A` | Primary text, high contrast                 |

### Semantic Surface Colors

| Token                       | Hex       | Usage                                 |
|-----------------------------|-----------|----------------------------------------|
| `--surface-background`      | `#FFFFFF` | App background                         |
| `--surface-page`            | `#F8FAFC` | Page/section background                |
| `--surface-card`            | `#FFFFFF` | Card surfaces                          |
| `--surface-card-hover`      | `#F8FAFC` | Card hover state                       |
| `--surface-overlay`         | `rgba(15, 23, 42, 0.5)` | Modal overlay            |
| `--surface-bottom-sheet`    | `#FFFFFF` | Bottom sheet background                |

### Text Colors

| Token               | Value     | Usage                                       |
|----------------------|-----------|----------------------------------------------|
| `--text-primary`     | `#0F172A` | Headlines, important labels                  |
| `--text-secondary`   | `#475569` | Body text, descriptions                      |
| `--text-muted`       | `#94A3B8` | Hints, placeholders, timestamps              |
| `--text-inverse`     | `#FFFFFF` | Text on dark/primary backgrounds             |
| `--text-link`        | `#2563EB` | Hyperlinks, tappable text                    |

---

## 2. Typography

**Primary Font:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Type Scale

| Name       | Size   | Line Height | Weight  | Letter Spacing | Usage                          |
|------------|--------|-------------|---------|----------------|--------------------------------|
| `display`  | 48px   | 56px (1.17) | 700     | -0.02em        | Hero headlines                 |
| `h1`       | 36px   | 44px (1.22) | 700     | -0.02em        | Page titles                    |
| `h2`       | 30px   | 38px (1.27) | 600     | -0.015em       | Section titles                 |
| `h3`       | 24px   | 32px (1.33) | 600     | -0.01em        | Card titles, subsections       |
| `h4`       | 20px   | 28px (1.4)  | 600     | -0.005em       | Widget titles                  |
| `h5`       | 18px   | 26px (1.44) | 600     | 0              | Large labels                   |
| `body-lg`  | 18px   | 28px (1.56) | 400     | 0              | Large body text                |
| `body`     | 16px   | 24px (1.5)  | 400     | 0              | Default body text              |
| `body-sm`  | 14px   | 20px (1.43) | 400     | 0.005em        | Secondary text, captions       |
| `caption`  | 12px   | 16px (1.33) | 500     | 0.01em         | Timestamps, badges, small info |
| `overline` | 12px   | 16px (1.33) | 600     | 0.05em         | Labels above fields, categories|

### CSS Custom Properties

```css
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --font-size-xs:  0.75rem;   /* 12px */
  --font-size-sm:  0.875rem;  /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg:  1.125rem;  /* 18px */
  --font-size-xl:  1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold: 600;
  --font-weight-bold:    700;

  --line-height-tight:  1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
}
```

---

## 3. Spacing System

Base unit: **4px**

| Token         | Value | Pixels | Usage                              |
|---------------|-------|--------|------------------------------------|
| `--space-0`   | 0     | 0px    | Reset                              |
| `--space-1`   | 0.25rem | 4px  | Tight inline spacing               |
| `--space-2`   | 0.5rem  | 8px  | Icon-to-text gap, compact padding  |
| `--space-3`   | 0.75rem | 12px | Small padding, list item gap       |
| `--space-4`   | 1rem    | 16px | Default padding, component gaps    |
| `--space-5`   | 1.25rem | 20px | Medium padding                     |
| `--space-6`   | 1.5rem  | 24px | Card padding, section gaps         |
| `--space-8`   | 2rem    | 32px | Large section gaps                 |
| `--space-10`  | 2.5rem  | 40px | Major section spacing              |
| `--space-12`  | 3rem    | 48px | Page section separation            |
| `--space-16`  | 4rem    | 64px | Top-level layout spacing           |
| `--space-20`  | 5rem    | 80px | Hero spacing                       |

### Layout Spacing Constants

```css
:root {
  --page-padding-mobile:  16px;
  --page-padding-tablet:  24px;
  --page-padding-desktop: 32px;

  --card-padding:         16px;
  --card-padding-lg:      24px;

  --bottom-nav-height:    64px;
  --top-bar-height:       56px;
  --bottom-cta-height:    80px;  /* includes safe area */

  --safe-area-bottom:     env(safe-area-inset-bottom, 0px);
  --safe-area-top:        env(safe-area-inset-top, 0px);
}
```

---

## 4. Border Radius

| Token               | Value   | Usage                                  |
|----------------------|---------|----------------------------------------|
| `--radius-sm`        | 6px     | Buttons (small), badges, chips         |
| `--radius-md`        | 8px     | Input fields, cards (compact)          |
| `--radius-lg`        | 12px    | Cards, modals, bottom sheets           |
| `--radius-xl`        | 16px    | Large cards, bottom sheet top corners  |
| `--radius-2xl`       | 24px    | Image containers, hero elements        |
| `--radius-full`      | 9999px  | Avatars, pills, circular buttons       |

---

## 5. Shadows (Elevation)

Warm-toned shadows using slate with low opacity to keep the light theme soft.

| Token           | Value                                                                 | Usage                          |
|-----------------|-----------------------------------------------------------------------|--------------------------------|
| `--shadow-sm`   | `0 1px 2px rgba(15, 23, 42, 0.05)`                                   | Cards at rest, input fields    |
| `--shadow-md`   | `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)` | Elevated cards, dropdowns |
| `--shadow-lg`   | `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` | Modals, bottom sheets, popovers |
| `--shadow-xl`   | `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)` | Floating action buttons, top sheets |

### Focus Ring

```css
--focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.4);
```

---

## 6. Breakpoints

| Name      | Min Width | Target                              |
|-----------|-----------|--------------------------------------|
| `mobile`  | 375px     | Default (design-first target)        |
| `tablet`  | 768px     | iPad, landscape phones               |
| `desktop` | 1024px    | Laptops, desktop browsers            |
| `wide`    | 1280px    | Large screens, admin dashboard       |

### Media Query Usage

```css
/* Mobile-first: base styles apply to mobile */

/* Tablet and up */
@media (min-width: 768px) { ... }

/* Desktop and up */
@media (min-width: 1024px) { ... }

/* Wide screens */
@media (min-width: 1280px) { ... }
```

### Container Max Widths

| Context        | Max Width |
|----------------|-----------|
| Content        | 640px     |
| Card grid      | 960px     |
| Admin layout   | 1280px    |
| Full bleed     | 100%      |

---

## 7. Icons

**Library:** [Lucide React](https://lucide.dev/) (`lucide-react`)

### Icon Sizes

| Size   | Pixels | Usage                                       |
|--------|--------|----------------------------------------------|
| `xs`   | 14px   | Inline with caption text                     |
| `sm`   | 16px   | Inline with body text, badges                |
| `md`   | 20px   | Buttons, input prefixes, list items          |
| `lg`   | 24px   | Navigation bar, card actions                 |
| `xl`   | 32px   | Feature icons, empty states                  |
| `2xl`  | 48px   | Hero empty states, onboarding                |

### Icon Color Mapping

- Default: `--color-neutral-500` (#64748B)
- Active/selected: `--color-primary-600` (#2563EB)
- Muted: `--color-neutral-400` (#94A3B8)
- On-primary: `#FFFFFF`
- Success: `--color-success-600` (#059669)
- Error: `--color-error-600` (#E11D48)

### Common Icons Used

| Purpose           | Icon Name          |
|--------------------|--------------------|
| Home               | `Home`             |
| Bookings           | `CalendarCheck`    |
| Track              | `MapPin`           |
| Profile            | `User`             |
| Search             | `Search`           |
| Back               | `ChevronLeft`      |
| Close              | `X`                |
| Car                | `Car`              |
| Calendar           | `Calendar`         |
| Clock              | `Clock`            |
| Phone              | `Phone`            |
| Star (rating)      | `Star`             |
| Navigation         | `Navigation`       |
| Settings           | `Settings`         |
| Logout             | `LogOut`           |
| Edit               | `Pencil`           |
| Delete             | `Trash2`           |
| Add                | `Plus`             |
| Filter             | `SlidersHorizontal`|
| Sort               | `ArrowUpDown`      |
| Success check      | `CheckCircle`      |
| Warning            | `AlertTriangle`    |
| Error              | `XCircle`          |
| Info               | `Info`             |
| Location from      | `CircleDot`        |
| Location to        | `MapPin`           |
| Rupee/Payment      | `IndianRupee`      |
| Driver             | `UserCheck`        |
| Document           | `FileText`         |
| Camera             | `Camera`           |
| Refresh            | `RefreshCw`        |

---

## 8. Z-Index Scale

| Token              | Value | Usage                              |
|--------------------|-------|------------------------------------|
| `--z-base`         | 0     | Default stacking                   |
| `--z-sticky`       | 100   | Sticky headers                     |
| `--z-fixed`        | 200   | Fixed nav bars                     |
| `--z-overlay`      | 300   | Backdrop overlays                  |
| `--z-modal`        | 400   | Bottom sheets, modals              |
| `--z-toast`        | 500   | Toast notifications                |
| `--z-tooltip`      | 600   | Tooltips, popovers                 |

---

## 9. Transitions & Easing

| Token                    | Value                    | Usage                        |
|--------------------------|--------------------------|-------------------------------|
| `--duration-fast`        | `150ms`                  | Hover, focus, color changes   |
| `--duration-normal`      | `250ms`                  | Expand, collapse, slide       |
| `--duration-slow`        | `350ms`                  | Page transitions, modals      |
| `--duration-slower`      | `500ms`                  | Complex animations            |
| `--ease-default`         | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose        |
| `--ease-in`              | `cubic-bezier(0.4, 0, 1, 1)`   | Elements exiting       |
| `--ease-out`             | `cubic-bezier(0, 0, 0.2, 1)`   | Elements entering      |
| `--ease-spring`          | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions |

---

## 10. Complete CSS Custom Properties

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Colors - Secondary */
  --color-secondary-50: #FFFBEB;
  --color-secondary-100: #FEF3C7;
  --color-secondary-200: #FDE68A;
  --color-secondary-300: #FCD34D;
  --color-secondary-400: #FBBF24;
  --color-secondary-500: #F59E0B;
  --color-secondary-600: #D97706;
  --color-secondary-700: #B45309;

  /* Colors - Success */
  --color-success-50: #ECFDF5;
  --color-success-100: #D1FAE5;
  --color-success-500: #10B981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  /* Colors - Error */
  --color-error-50: #FFF1F2;
  --color-error-100: #FFE4E6;
  --color-error-500: #F43F5E;
  --color-error-600: #E11D48;
  --color-error-700: #BE123C;

  /* Colors - Warning */
  --color-warning-50: #FFF7ED;
  --color-warning-100: #FFEDD5;
  --color-warning-500: #F97316;
  --color-warning-600: #EA580C;

  /* Colors - Neutral */
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;

  /* Surfaces */
  --surface-background: #FFFFFF;
  --surface-page: #F8FAFC;
  --surface-card: #FFFFFF;
  --surface-overlay: rgba(15, 23, 42, 0.5);

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --text-inverse: #FFFFFF;
  --text-link: #2563EB;

  /* Typography */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
  --shadow-xl: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05);

  /* Focus */
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.4);

  /* Z-Index */
  --z-base: 0;
  --z-sticky: 100;
  --z-fixed: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;

  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Layout */
  --page-padding-mobile: 16px;
  --page-padding-tablet: 24px;
  --page-padding-desktop: 32px;
  --bottom-nav-height: 64px;
  --top-bar-height: 56px;
  --bottom-cta-height: 80px;
}
```
