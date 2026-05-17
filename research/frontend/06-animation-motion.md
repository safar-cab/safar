# Books Car Rental -- Animation & Motion Design

Version 1.0 | Framer Motion + CSS Animations | 60fps Target

---

## 1. Page Transitions

### Push Navigation (Forward)

When navigating deeper (e.g., Home -> Booking Detail):

```
  Current Page               New Page
+----------------+     +----------------+
|                |     |                |
|   slides to    | <-- |  slides in     |
|   left (-30%)  |     |  from right    |
|   + opacity    |     |  (100% -> 0%)  |
|    0.6         |     |                |
+----------------+     +----------------+
```

```typescript
// Framer Motion variants
const pageTransition = {
  initial: {
    x: '100%',
    opacity: 0.8,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    x: '-30%',
    opacity: 0.6,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

### Pop Navigation (Back)

```
  Previous Page               Current Page
+----------------+     +----------------+
|                |     |                |
|  slides in     | --> |  slides out    |
|  from left     |     |  to right      |
|  (-30% -> 0%)  |     |  (0% -> 100%)  |
+----------------+     +----------------+
```

```typescript
const pageTransitionBack = {
  initial: {
    x: '-30%',
    opacity: 0.6,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

### Tab Switch (Fade)

```typescript
const tabTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};
```

### Modal / Full-Screen Overlay

```typescript
const modalTransition = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};
```

---

## 2. Micro-Interactions

### Button Press

```css
.button {
  transition: transform 150ms var(--ease-default),
              background-color 150ms var(--ease-default),
              box-shadow 150ms var(--ease-default);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: scale(0.98) translateY(0);
  box-shadow: var(--shadow-sm);
}
```

```typescript
// Framer Motion button with spring
const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98 },
};

<motion.button
  variants={buttonVariants}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
```

### Toggle Switch

```
OFF:  [O        ]     ->    ON:  [        O]
      gray bg                    blue bg
```

```css
.toggle-track {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: #CBD5E1;
  transition: background-color 200ms ease;
  position: relative;
}

.toggle-track.on {
  background: #2563EB;
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-track.on .toggle-thumb {
  transform: translateX(20px);
}
```

### Heart / Favorite

```typescript
const heartVariants = {
  unliked: { scale: 1, color: '#94A3B8' },
  liked: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    color: '#E11D48',
    transition: {
      scale: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] },
      color: { duration: 0.1 },
    },
  },
};
```

### Star Rating (Tap)

```typescript
const starVariants = {
  empty: {
    scale: 1,
    color: '#E2E8F0',
  },
  filled: {
    scale: [1, 1.3, 1],
    color: '#F59E0B',
    transition: {
      scale: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      },
      color: {
        duration: 0.1,
      },
    },
  },
};

// Staggered fill: each star animates 50ms after the previous
<motion.div
  animate="filled"
  transition={{ delay: index * 0.05 }}
>
```

### Checkbox

```css
.checkbox-input:checked + .checkbox-visual {
  background: #2563EB;
  border-color: #2563EB;
}

.checkbox-check {
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
  transition: stroke-dashoffset 200ms ease 50ms;
}

.checkbox-input:checked + .checkbox-visual .checkbox-check {
  stroke-dashoffset: 0;
}
```

### Counter Animation (Stat Cards)

```typescript
// Animate numbers counting up
const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};
```

### Ripple Effect (Material-style, optional)

```css
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-expand 600ms ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 3. Loading Animations

### Skeleton Shimmer

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F1F5F9 0%,
    #F1F5F9 25%,
    #E2E8F0 50%,
    #F1F5F9 75%,
    #F1F5F9 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Skeleton to Content Transition

```typescript
const skeletonToContent = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Usage
{isLoading ? (
  <SkeletonCard />
) : (
  <motion.div {...skeletonToContent}>
    <ActualCard data={data} />
  </motion.div>
)}
```

### Progress Bar (Payment, Upload)

```css
.progress-bar {
  height: 4px;
  background: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #2563EB;
  border-radius: 9999px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Indeterminate variant */
.progress-bar-indeterminate .progress-bar-fill {
  width: 40%;
  animation: indeterminate 1.5s ease-in-out infinite;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}
```

### Content Loading Spinner (Inline)

Used only for small inline loading states (button loading, refreshing data).

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dark variant (for use on light backgrounds) */
.spinner-dark {
  border-color: rgba(37, 99, 235, 0.2);
  border-top-color: #2563EB;
}
```

---

## 4. Map Marker Animations

### Driver Location Pulse

```css
.driver-marker {
  position: relative;
  z-index: 10;
}

.driver-marker-dot {
  width: 16px;
  height: 16px;
  background: #2563EB;
  border: 3px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

.driver-marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(37, 99, 235, 0.4);
  animation: marker-pulse 2s ease-out infinite;
}

@keyframes marker-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
```

### Bounce on Arrival

When a car marker arrives at a pickup/drop point:

```typescript
const bounceAnimation = {
  y: [0, -20, 0, -10, 0, -5, 0],
  transition: {
    duration: 0.8,
    times: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1],
    ease: 'easeOut',
  },
};
```

```css
@keyframes marker-bounce {
  0%, 100% { transform: translateY(0); }
  20%      { transform: translateY(-20px); }
  40%      { transform: translateY(0); }
  55%      { transform: translateY(-10px); }
  70%      { transform: translateY(0); }
  85%      { transform: translateY(-5px); }
}

.marker-bounce {
  animation: marker-bounce 0.8s ease-out;
}
```

### Car Marker Rotation

```typescript
// Smoothly rotate car icon to match heading direction
const CarMarker = ({ heading }: { heading: number }) => (
  <motion.div
    animate={{ rotate: heading }}
    transition={{
      type: 'spring',
      stiffness: 100,
      damping: 20,
    }}
  >
    <Car size={32} />
  </motion.div>
);
```

### Route Line Drawing

```css
/* Animate route path drawing on map load */
.route-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-route 1.5s ease-out forwards;
}

@keyframes draw-route {
  to {
    stroke-dashoffset: 0;
  }
}
```

### Pickup/Drop Pin Drop

```css
@keyframes pin-drop {
  0% {
    transform: translateY(-200px);
    opacity: 0;
  }
  60% {
    transform: translateY(10px);
    opacity: 1;
  }
  80% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

.pin-marker {
  animation: pin-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

---

## 5. Status Change Celebrations

### Booking Confirmed -- Confetti

Triggered when booking status changes to "confirmed" after payment.

```typescript
// Using canvas-confetti library
import confetti from 'canvas-confetti';

const celebrateBookingConfirmed = () => {
  // First burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#2563EB', '#F59E0B', '#10B981', '#FFFFFF'],
  });

  // Second burst (delayed)
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#2563EB', '#F59E0B'],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10B981', '#3B82F6'],
    });
  }, 250);
};
```

### Success Checkmark Animation

After payment completes, a check mark draws itself.

```css
.success-checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #059669;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #D1FAE5;
  animation: fill-green 0.4s ease-in-out 0.4s forwards,
             scale-check 0.3s ease-in-out 0.9s both;
}

.success-checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #059669;
  fill: none;
  animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.success-checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke-circle {
  100% { stroke-dashoffset: 0; }
}

@keyframes stroke-check {
  100% { stroke-dashoffset: 0; }
}

@keyframes fill-green {
  100% {
    box-shadow: inset 0 0 0 40px #ECFDF5;
  }
}

@keyframes scale-check {
  0%, 100% { transform: none; }
  50% { transform: scale3d(1.1, 1.1, 1); }
}
```

### Ride Completed -- Subtle Celebration

```typescript
// Lighter celebration for ride completion
const rideCompletedAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};
```

---

## 6. Spring Physics for Bottom Sheets

### Bottom Sheet Spring Configuration

```typescript
const bottomSheetSpring = {
  type: 'spring',
  damping: 30,
  stiffness: 300,
  mass: 0.8,
};

// Bottom sheet with drag-to-dismiss
const BottomSheet = ({ isOpen, onClose, children, snapPoints = [0.4, 0.7, 0.9] }) => {
  const sheetHeight = window.innerHeight;
  const snapPixels = snapPoints.map(p => sheetHeight * (1 - p));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="bottom-sheet"
            initial={{ y: sheetHeight }}
            animate={{ y: snapPixels[0] }}
            exit={{ y: sheetHeight }}
            transition={bottomSheetSpring}
            drag="y"
            dragConstraints={{
              top: snapPixels[snapPixels.length - 1],
              bottom: sheetHeight,
            }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 800 || info.offset.y > sheetHeight * 0.3) {
                onClose();
              } else {
                // Snap to nearest snap point
                const closestSnap = snapPixels.reduce((prev, curr) =>
                  Math.abs(curr - info.point.y) < Math.abs(prev - info.point.y)
                    ? curr : prev
                );
                // animate to closestSnap
              }
            }}
          >
            <div className="bottom-sheet-handle" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Rubber Band Effect (Over-scroll)

```typescript
// When dragging past bounds, apply resistance
const rubberBand = (distance: number, dimension: number, constant = 0.55) => {
  return (distance * dimension * constant) / (dimension + constant * distance);
};
```

### Bottom Sheet Snap Points

```
+------------------------------------------+
|  90% ---> Full expanded (complex content)|
|                                          |
|                                          |
|  70% ---> Medium (forms, details)        |
|                                          |
|  40% ---> Peek (summary info)            |
|                                          |
|   0% ---> Closed (dismissed)             |
+------------------------------------------+
```

| Sheet Use Case       | Default Snap | Allowed Snaps |
|----------------------|-------------|----------------|
| Action menu          | 40%         | 40%, 0%        |
| Car detail           | 70%         | 40%, 70%, 0%   |
| Driver info (track)  | 40%         | 40%, 70%, 0%   |
| Filter               | 70%         | 70%, 0%        |
| City search          | 90%         | 90%, 0%        |
| Confirmation         | 40%         | 40%, 0%        |

---

## 7. Staggered List Item Animations

### List Appear Animation

When a list loads, items stagger in from the bottom.

```typescript
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,    // 50ms between each item
      delayChildren: 0.1,       // 100ms initial delay
    },
  },
};

const listItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Usage
<motion.div
  variants={listContainerVariants}
  initial="hidden"
  animate="visible"
>
  {bookings.map((booking) => (
    <motion.div key={booking.id} variants={listItemVariants}>
      <BookingCard booking={booking} />
    </motion.div>
  ))}
</motion.div>
```

### Performance Rules for Stagger

| List Size    | Stagger Delay | Max Animated |
|-------------|---------------|--------------|
| 1-5 items   | 80ms          | All          |
| 6-10 items  | 50ms          | All          |
| 11-20 items | 30ms          | First 10     |
| 20+ items   | 0ms           | None (fade in as group) |

### Card Grid Stagger

For 2+ column grids (car selection), stagger by row then column:

```typescript
const gridItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 15,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

// Usage
{cars.map((car, index) => (
  <motion.div
    key={car.id}
    variants={gridItemVariants}
    initial="hidden"
    animate="visible"
    custom={index}
  >
    <CarCard car={car} />
  </motion.div>
))}
```

### Item Removal Animation

When a booking is cancelled or an item is removed:

```typescript
const removeItemVariants = {
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3, delay: 0.1 },
      margin: { duration: 0.3, delay: 0.1 },
      padding: { duration: 0.3, delay: 0.1 },
    },
  },
};
```

---

## 8. Notification & Toast Animations

### Toast Entry/Exit

```typescript
const toastVariants = {
  initial: {
    y: -100,
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
```

### Toast Auto-Dismiss Progress Bar

```css
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 0 0 12px 12px;
  animation: toast-countdown 4s linear forwards;
}

@keyframes toast-countdown {
  from { width: 100%; }
  to { width: 0%; }
}
```

---

## 9. Reduced Motion Support

All animations must respect the user's motion preference.

```typescript
// Hook for checking motion preference
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
};
```

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .skeleton {
    animation: none;
    background: #F1F5F9;
  }
}
```

### Reduced Motion Alternatives

| Full Motion                | Reduced Motion Alternative      |
|----------------------------|----------------------------------|
| Slide transition           | Instant cut / fade 100ms         |
| Confetti celebration       | Static success icon              |
| Skeleton shimmer           | Static gray placeholder          |
| Staggered list entry       | All items appear at once         |
| Bounce on arrive           | Static pin placement             |
| Star rating scale          | Instant color change             |
| Bottom sheet spring        | Instant show/hide                |
| Pulse on map marker        | Static colored ring              |

---

## 10. Animation Performance Guidelines

### Rules

1. **Only animate `transform` and `opacity`** -- these are GPU-composited and do not trigger layout or paint.
2. **Use `will-change` sparingly** -- only on elements about to animate, remove after.
3. **Keep animations under 16ms per frame** (60fps budget).
4. **Avoid animating during scroll** -- can cause jank.
5. **Use `requestAnimationFrame`** for JS-driven animations.
6. **Batch DOM reads and writes** -- avoid layout thrashing.

### CSS Performance Hints

```css
/* Apply before animation starts */
.will-animate {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.animation-done {
  will-change: auto;
}

/* Use 3D transforms to force GPU layer */
.gpu-accelerated {
  transform: translateZ(0);
  /* or */
  transform: translate3d(0, 0, 0);
}

/* Contain layout during animation */
.animated-container {
  contain: layout style;
}
```

### Animation Budget Per Page

| Page Type          | Max Concurrent Animations | Notes                    |
|--------------------|---------------------------|--------------------------|
| Home               | 5                         | Carousel, stagger, search|
| Search results     | 8                         | Staggered card entry     |
| Booking form       | 3                         | Step transition, inputs  |
| Live tracking      | 3                         | Car, pulse, ETA counter  |
| Admin dashboard    | 6                         | Charts, counters, cards  |
| Payment success    | 4                         | Check, confetti, text    |
