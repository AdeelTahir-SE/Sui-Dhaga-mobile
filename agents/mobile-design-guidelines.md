# Mobile Design Guidelines

## Purpose

This document defines the design implementation rules for the Sui Dhaga mobile application.

The visual designs inside:

```txt
agents/ui-designs/
```

are the source of truth.

Agents must implement screens according to those designs.

Do not invent new layouts.

Do not redesign screens.

Do not introduce new design systems.

---

# Source Of Truth

Always follow the designs located in:

```txt
agents/ui-designs/
```

If a design exists in those files:

* Follow it exactly.
* Do not simplify it.
* Do not redesign it.
* Do not replace sections.

---

# Design Consistency

When creating new screens:

* Reuse existing patterns.
* Reuse existing spacing.
* Reuse existing cards.
* Reuse existing buttons.
* Reuse existing typography.

New UI patterns should only be created when no existing pattern is available.

---

# Mobile First

All screens must be optimized for mobile devices.

Support:

* Small phones
* Large phones
* Tablets

---

# Component Reuse

Before creating a new component:

1. Search existing components.
2. Reuse existing component if possible.
3. Create a new component only when necessary.

Avoid duplicate UI components.

---

# Styling

Use:

```txt
src/styles/
```

for shared styling.

Avoid hardcoded values throughout the application.

---

# Theme

Use values defined in:

```txt
src/styles/theme.ts
```

Do not hardcode:

* Colors
* Radius values
* Typography values
* Shadows

---

# Screen Structure

Pages inside:

```txt
app/
```

should contain routing only.

Business logic should live inside:

```txt
src/features/
```

Reusable UI should live inside:

```txt
src/components/
```

---

# Lists

Use optimized lists for large datasets.

Examples:

* Tailors
* Orders
* Messages
* Community Feed
* Designs

Avoid rendering large arrays directly.

---

# Images

Optimize all images.

Use lazy loading where possible.

Avoid loading full-resolution images in lists.

---

# Forms

Use shared form components.

Use Zod validation schemas.

Do not duplicate validation logic.

---

# Accessibility

All interactive elements must:

* Have labels
* Support screen readers
* Have sufficient touch area

---

# Responsive Behavior

Layouts should adapt to:

* Small phones
* Large phones
* Tablets

Avoid fixed dimensions whenever possible.

---

# Final Rule

The files inside:

```txt
agents/ui-designs/
```

are the design source of truth.

If this document conflicts with those designs:

Follow the designs.

