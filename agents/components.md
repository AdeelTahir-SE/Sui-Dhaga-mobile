# Components Guide

## Purpose

This document defines how components should be created, organized, and reused in the Sui Dhaga mobile app.

---

# Component Folders

Components are divided into two types:

```txt
src/components/
```

Shared reusable components.

```txt
src/features/[feature-name]/components/
```

Feature-specific components.

---

# Shared Components

Use `src/components/` for components used in more than one feature.

Example:

```txt
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/cards/TailorCard.tsx
src/components/layout/Screen.tsx
```

---

# Feature Components

Use feature component folders when the component is only used inside one feature.

Example:

```txt
src/features/design-studio/components/DesignPreview.tsx
src/features/tailors/components/TailorFilters.tsx
```

---

# Component Rule

Before creating a new component:

1. Check `src/components/`
2. Check the current feature components
3. Reuse existing components if possible
4. Create a new component only when needed

---

# Basic Shared Components

Create these common components first:

```txt
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/TextArea.tsx
src/components/ui/Card.tsx
src/components/ui/Avatar.tsx
src/components/ui/Badge.tsx
src/components/ui/Loader.tsx
src/components/ui/EmptyState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/BottomSheet.tsx
src/components/ui/Modal.tsx
```

---

# Layout Components

Create layout components here:

```txt
src/components/layout/Screen.tsx
src/components/layout/Header.tsx
src/components/layout/Section.tsx
src/components/layout/ListHeader.tsx
```

---

# Card Components

Create reusable cards here:

```txt
src/components/cards/TailorCard.tsx
src/components/cards/DesignCard.tsx
src/components/cards/OrderCard.tsx
src/components/cards/AppointmentCard.tsx
src/components/cards/CommunityPostCard.tsx
src/components/cards/MessageCard.tsx
```

---

# Map Components

Create map-related components here:

```txt
src/components/maps/TailorMap.tsx
src/components/maps/TailorMapMarker.tsx
src/components/maps/TailorPreviewCard.tsx
```

---

# Design Studio Components

Create reusable design studio components here:

```txt
src/components/design-studio/DesignPreview.tsx
src/components/design-studio/DesignOptionCard.tsx
src/components/design-studio/DesignPromptInput.tsx
src/components/design-studio/DesignToolPanel.tsx
src/components/design-studio/FabricSelector.tsx
src/components/design-studio/ColorSelector.tsx
```

---

# Tailor Components

Create reusable tailor components here:

```txt
src/components/tailor/TailorHeader.tsx
src/components/tailor/TailorGallery.tsx
src/components/tailor/TailorServiceCard.tsx
src/components/tailor/TailorReviewCard.tsx
src/components/tailor/TailorRating.tsx
```

---

# Orders Components

Create reusable order components here:

```txt
src/components/orders/OrderTrackingTimeline.tsx
src/components/orders/OrderSummary.tsx
src/components/orders/PaymentSummary.tsx
```

---

# Community Components

Create reusable community components here:

```txt
src/components/community/PostImage.tsx
src/components/community/PostActions.tsx
src/components/community/CommentCard.tsx
```

---

# Measurements Components

Create reusable measurement components here:

```txt
src/components/measurements/BodyDiagram.tsx
src/components/measurements/MeasurementCard.tsx
src/components/measurements/MeasurementForm.tsx
```

---

# Component Standards

Every component must:

* Use TypeScript
* Accept typed props
* Avoid `any`
* Be reusable where possible
* Avoid direct API calls
* Avoid route-specific logic

---

# Naming Rules

Use PascalCase for components.

Good:

```txt
TailorCard.tsx
DesignPreview.tsx
OrderSummary.tsx
```

Bad:

```txt
tailor-card.tsx
design_preview.tsx
ordersummary.tsx
```

---

# Props Rule

Define props clearly.

Example:

```tsx
type TailorCardProps = {
  name: string;
  rating: number;
  specialty: string;
  imageUrl?: string;
  onPress?: () => void;
};

export function TailorCard(props: TailorCardProps) {
  return null;
}
```

---

# API Rule

Components must not directly call backend APIs.

Correct:

```txt
Screen → Hook → API
```

Wrong:

```txt
Component → API
```

---

# Styling Rule

Components should use shared theme values.

Do not hardcode colors repeatedly.

Use:

```txt
src/styles/theme.ts
```

---

# Final Rule

Reuse before creating.

Do not duplicate components that already exist.
