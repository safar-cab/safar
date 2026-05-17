# Accessibility & Internationalization

## Accessibility (WCAG 2.1 AA)

### MVP Essentials
- Semantic HTML (header, main, nav, footer, section)
- Alt text on all images
- Keyboard navigation for all interactive elements
- Focus indicators visible
- Color contrast ratio: 4.5:1 minimum (text), 3:1 (large text)
- Form labels associated with inputs
- Error messages announced to screen readers
- Skip navigation link
- Responsive: works on 320px to 4K

### shadcn/ui Advantage
Built on Radix UI primitives — accessible by default:
- ARIA attributes pre-configured
- Keyboard interactions built-in
- Focus management handled
- Screen reader announcements

### Testing
- Lighthouse accessibility audit (target: 90+)
- Tab through every form
- Test with browser zoom 200%

---

## Internationalization (Future)

### MVP: English Only
No i18n setup needed for launch. Add when expanding beyond MP.

### Future i18n Architecture (When Needed)
- Use `next-intl` or `next-i18next`
- URL-based locale: `/en/book`, `/hi/book`
- Default: English
- Phase 2: Hindi
- Phase 3: Marathi, Gujarati (neighboring states)

### What to Prepare Now
- Don't hardcode strings in JSX — use variables/constants
- Use `date-fns` for date formatting (locale-aware)
- Use `Intl.NumberFormat` for currency formatting
- Store translatable strings separately (even if only English)

### Currency & Date Handling
```typescript
// Already locale-aware
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
// Output: ₹2,825.00

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
// Output: 3 May 2026, 9:00 am
```

### RTL Support
Not needed for Hindi (LTR). Only needed for Urdu/Arabic (future, unlikely).
